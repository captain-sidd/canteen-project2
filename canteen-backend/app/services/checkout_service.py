import logging

from datetime import datetime
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.base import ensure_object_id, now_utc
from app.schemas.enums import DiscountType

logger = logging.getLogger(__name__)

DEFAULT_TAX_RATE = 0.05


def _normalize_offer_code(code: str) -> str:
    return code.strip().upper()


async def _fetch_menu_or_combo_item(db: AsyncIOMotorDatabase, menu_item_id: str) -> dict:
    try:
        object_id = ensure_object_id(menu_item_id)
    except ValueError as exc:
        logger.warning("Invalid menu item id provided: %s", menu_item_id)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid menu item id: {menu_item_id}",
        ) from exc

    item = await db.menu_items.find_one({"_id": object_id, "is_available": True})
    if item is None:
        item = await db.combos.find_one({"_id": object_id, "is_available": True})

    if item is None:
        logger.warning("Menu item or combo not found: %s", menu_item_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item not found or unavailable: {menu_item_id}",
        )

    return item


def _determine_active_price(menu_item: dict) -> tuple[float, float, bool]:
    regular_price = menu_item.get("price")
    if regular_price is None:
        logger.error("Menu item missing regular price: %s", menu_item.get("_id"))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Menu item missing price: {menu_item.get('name', 'unknown')}",
        )

    if menu_item.get("is_offer_active") and menu_item.get("discount_price") is not None:
        active_price = menu_item["discount_price"]
        is_discounted = True
    else:
        active_price = menu_item.get("discount_price") if menu_item.get("discount_price") is not None else regular_price
        is_discounted = menu_item.get("is_offer_active", False) and menu_item.get("discount_price") is not None

    try:
        active_price = float(active_price)
        regular_price = float(regular_price)
    except (TypeError, ValueError) as exc:
        logger.error("Invalid pricing values for item %s: regular=%s active=%s", menu_item.get("_id"), regular_price, active_price)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid price value for item: {menu_item.get('name', 'unknown')}",
        ) from exc

    if active_price < 0 or regular_price < 0:
        logger.error("Negative price values for item %s: regular=%s active=%s", menu_item.get("_id"), regular_price, active_price)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid negative price for item: {menu_item.get('name', 'unknown')}",
        )

    return regular_price, active_price, is_discounted


async def _fetch_offer(db: AsyncIOMotorDatabase, offer_code: str, net_total: float) -> dict | None:
    if not offer_code:
        return None

    code = _normalize_offer_code(offer_code)
    offer = await db.offers.find_one({"code": code, "is_active": True})

    if offer is None:
        logger.warning("Offer code not found or inactive: %s", offer_code)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Offer code not found: {offer_code}",
        )

    expiry = offer.get("expiry_date")
    if expiry is not None and now_utc() > expiry:
        logger.warning("Expired offer code used: %s", offer_code)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Offer code expired: {offer_code}",
        )

    min_order = offer.get("min_order_amount")
    if min_order is not None and net_total < float(min_order):
        logger.warning(
            "Offer code %s minimum order not met: net_total=%s min=%s",
            offer_code,
            net_total,
            min_order,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Offer code minimum order amount is {min_order}",
        )

    return offer


def _calculate_offer_discount(offer: dict, amount: float) -> float:
    if offer is None:
        return 0.0

    discount_type = offer.get("discount_type")
    value = float(offer.get("discount_value", 0.0))
    max_discount = offer.get("max_discount")

    if discount_type == DiscountType.percentage.value:
        discount = amount * (value / 100.0)
    else:
        discount = value

    if max_discount is not None:
        try:
            max_discount_value = float(max_discount)
            discount = min(discount, max_discount_value)
        except (TypeError, ValueError):
            logger.warning("Invalid max_discount value on offer %s: %s", offer.get("code"), max_discount)

    discount = min(discount, amount)
    return round(discount, 2)


def _calculate_tax_amount(amount: float) -> float:
    if amount <= 0:
        return 0.0
    return round(amount * DEFAULT_TAX_RATE, 2)


async def build_priced_items(db: AsyncIOMotorDatabase, items: list[dict]) -> tuple[list[dict], float, float]:
    priced_items: list[dict] = []
    subtotal = 0.0
    item_discount = 0.0

    for order_item in items:
        menu_item = await _fetch_menu_or_combo_item(db, order_item["menu_item_id"])
        regular_price, active_price, is_discounted = _determine_active_price(menu_item)

        quantity = int(order_item["quantity"])
        line_subtotal = regular_price * quantity
        line_total = active_price * quantity
        line_discount = max(0.0, line_subtotal - line_total)

        subtotal += line_subtotal
        item_discount += line_discount

        priced_items.append(
            {
                "menu_item_id": order_item["menu_item_id"],
                "name": menu_item.get("name", "Unknown item"),
                "unit_price": active_price,
                "regular_price": regular_price,
                "quantity": quantity,
                "item_discount": round(line_discount, 2),
                "total_price": round(line_total, 2),
                "is_offer_active": bool(is_discounted),
                "offer_tag": menu_item.get("offer_tag"),
            }
        )

    return priced_items, round(subtotal, 2), round(item_discount, 2)


async def calculate_checkout_summary(
    db: AsyncIOMotorDatabase,
    items: list[dict],
    offer_code: str | None = None,
) -> dict:
    logger.debug("Calculating checkout summary for %d items, offer_code=%s", len(items), offer_code)

    priced_items, subtotal, item_discount = await build_priced_items(db, items)
    logger.debug("Subtotal=%s item_discount=%s", subtotal, item_discount)

    net_subtotal = round(subtotal - item_discount, 2)
    offer = await _fetch_offer(db, offer_code, net_subtotal) if offer_code else None
    offer_discount = _calculate_offer_discount(offer, net_subtotal)

    taxable_amount = round(net_subtotal - offer_discount, 2)
    tax_amount = _calculate_tax_amount(taxable_amount)
    final_total = max(round(taxable_amount + tax_amount, 2), 0.0)

    result = {
        "subtotal": subtotal,
        "item_discount": item_discount,
        "offer_discount": offer_discount,
        "tax_amount": tax_amount,
        "final_total": final_total,
        "applied_offer": offer,
        "items": priced_items,
    }
    logger.debug("Checkout summary result: %s", result)
    return result
