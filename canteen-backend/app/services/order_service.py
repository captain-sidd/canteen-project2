import logging
from enum import Enum

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.models.base import ensure_object_id, now_utc, object_id_to_str
from app.models.order import ORDER_STATUSES, create_order_document
from app.schemas.enums import PaymentMethod
from app.schemas.order import OrderCreate, OrderUpdateStatus
from app.services.checkout_service import build_priced_items
from app.services.qr_service import build_order_qr_data, generate_qr_code_base64

logger = logging.getLogger(__name__)


def normalize_order_document(order: dict | None) -> dict | None:
    if order is None:
        return None

    order = object_id_to_str(order)
    order.setdefault("order_type", "dine_in")
    order.setdefault("payment_status", "pending")
    order.setdefault("qr_code", None)
    order.setdefault("subtotal", float(order.get("subtotal", order.get("total_amount", 0.0))))
    order.setdefault("discount_amount", float(order.get("discount_amount", 0.0)))
    order.setdefault("tax_amount", float(order.get("tax_amount", 0.0)))
    order.setdefault("payment_method", order.get("payment_method", PaymentMethod.cash.value))
    order.setdefault("payment_id", order.get("payment_id") or order.get("payment_transaction_id"))
    order.setdefault("payment_transaction_id", order.get("payment_transaction_id") or order.get("payment_id"))
    order.setdefault("wallet_transaction_id", order.get("wallet_transaction_id"))
    order.setdefault("order_status", order.get("order_status", order.get("status", "pending")))
    order.setdefault("estimated_ready_time", order.get("estimated_ready_time"))
    order.setdefault("receipt_url", order.get("receipt_url"))
    order.setdefault("notes", order.get("notes"))
    order.setdefault(
        "status_history",
        order.get("status_history", [{"status": order.get("status", "pending"), "updated_at": order.get("updated_at")}]),
    )

    for item in order.get("items", []):
        if "price" not in item and "unit_price" in item:
            item["price"] = item["unit_price"]

    return order


async def build_order_items(db: AsyncIOMotorDatabase, payload: OrderCreate) -> tuple[list[dict], float]:
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Order must contain at least one item.",
        )

    raw_items: list[dict] = []
    for item in payload.items:
        item_data = item.model_dump()
        if not isinstance(item_data.get("menu_item_id"), str) or not item_data["menu_item_id"].strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Each order item must include a valid menu_item_id.",
            )
        if not isinstance(item_data.get("quantity"), int) or item_data["quantity"] <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Each order item must include a quantity greater than zero.",
            )
        raw_items.append(item_data)

    priced_items, subtotal, _ = await build_priced_items(db, raw_items)
    adapted_items = [
        {
            "menu_item_id": item["menu_item_id"],
            "name": item["name"],
            "price": item["unit_price"],
            "quantity": item["quantity"],
        }
        for item in priced_items
    ]
    return adapted_items, subtotal


async def _fetch_user_names(db: AsyncIOMotorDatabase, user_ids: list[str]) -> dict[str, str]:
    unique_ids = list({user_id for user_id in user_ids if user_id})
    if not unique_ids:
        return {}

    object_ids = []
    for user_id in unique_ids:
        try:
            object_ids.append(ensure_object_id(user_id))
        except ValueError:
            continue

    if not object_ids:
        return {}

    cursor = db.users.find({"_id": {"$in": object_ids}}, {"name": 1})
    user_map = {}
    async for user in cursor:
        user = object_id_to_str(user)
        user_map[user["id"]] = user.get("name") or ''
    return user_map


async def _enrich_orders_with_customer_names(db: AsyncIOMotorDatabase, orders: list[dict]) -> list[dict]:
    user_ids = [order.get("user_id") for order in orders if order.get("user_id")]
    user_name_map = await _fetch_user_names(db, user_ids)
    for order in orders:
        order["customer_name"] = order.get("customer_name") or user_name_map.get(order.get("user_id"), None)
    return orders


async def create_order(db: AsyncIOMotorDatabase, user_id: str, payload: OrderCreate, current_user: dict | None = None) -> dict:
    try:
        order_items, total_amount = await build_order_items(db, payload)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Order build failed for user %s: %s", user_id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order payload or order item data.",
        ) from exc

    if not order_items:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Order must contain valid items.",
        )

    logger.debug(
        "Creating order for user=%s payment_id=%s payment_method=%s payment_status=%s total_amount=%s items=%s",
        user_id,
        payload.payment_id,
        payload.payment_method,
        payload.payment_status,
        total_amount,
        [item.get("menu_item_id") for item in order_items],
    )

    document = create_order_document(
        user_id=user_id,
        items=order_items,
        total_amount=total_amount,
        order_type=payload.order_type,
        payment_status=payload.payment_status,
        payment_method=payload.payment_method,
        notes=payload.notes,
        payment_id=payload.payment_id,
    )

    try:
        result = await db.orders.insert_one(document)
    except Exception as exc:
        logger.error("Failed to insert order for user %s: %s", user_id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order.",
        ) from exc

    try:
        created_order = await db.orders.find_one({"_id": result.inserted_id})
    except Exception as exc:
        logger.error("Failed to fetch created order for user %s: %s", user_id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve created order.",
        ) from exc

    if created_order is None:
        logger.error("Inserted order not found for user %s, id=%s", user_id, result.inserted_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Created order could not be retrieved.",
        )

    created_order = normalize_order_document(created_order)
    if current_user is not None:
        created_order["customer_name"] = current_user.get("name")
    qr_data = build_order_qr_data(created_order["id"], user_id)
    created_order["qr_code"] = generate_qr_code_base64(qr_data)

    await db.orders.update_one(
        {"_id": result.inserted_id},
        {"$set": {"qr_code": created_order["qr_code"], "updated_at": now_utc()}},
    )
    return created_order


async def list_user_orders(db: AsyncIOMotorDatabase, current_user: dict) -> list[dict]:
    cursor = db.orders.find({"user_id": current_user["id"]}).sort("created_at", -1)
    orders = [normalize_order_document(order) async for order in cursor]
    for order in orders:
        order["customer_name"] = current_user.get("name")
    return orders


async def list_all_orders(db: AsyncIOMotorDatabase, limit: int = 50) -> list[dict]:
    cursor = db.orders.find({}).sort("created_at", -1).limit(limit)
    orders = [normalize_order_document(order) async for order in cursor]
    return await _enrich_orders_with_customer_names(db, orders)


async def get_order(db: AsyncIOMotorDatabase, order_id: str, current_user: dict) -> dict | None:
    try:
        object_id = ensure_object_id(order_id)
    except ValueError:
        return None
    order = await db.orders.find_one({"_id": object_id, "user_id": current_user["id"]})
    order = normalize_order_document(order)
    if order is not None:
        order["customer_name"] = current_user.get("name")
    return order


async def update_order_status(db: AsyncIOMotorDatabase, order_id: str, payload: OrderUpdateStatus) -> dict:
    if payload.status not in ORDER_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid order status",
        )

    try:
        object_id = ensure_object_id(order_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid order id",
        ) from exc

    order = await db.orders.find_one({"_id": object_id})
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    current_status = order.get("order_status", order.get("status", "pending"))

    # Validate transitions
    valid_transitions = {
        "pending": ["preparing"],
        "preparing": ["ready"],
        "ready": ["completed"],
        "completed": [],
        "cancelled": [],
    }

    if payload.status not in valid_transitions.get(current_status, []):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status transition from {current_status} to {payload.status}",
        )

    status_history = order.get("status_history", [])
    status_history.append({"status": payload.status, "updated_at": now_utc()})

    updated = await db.orders.find_one_and_update(
        {"_id": object_id},
        {
            "$set": {
                "status": payload.status,
                "order_status": payload.status,
                "status_history": status_history,
                "updated_at": now_utc(),
            }
        },
        return_document=ReturnDocument.AFTER,
    )
    return normalize_order_document(updated)
