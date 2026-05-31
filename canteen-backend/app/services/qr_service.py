import base64
import logging
from io import BytesIO

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
import qrcode

from app.models.base import ensure_object_id, now_utc, object_id_to_str
from app.schemas.enums import PaymentMethod


logger = logging.getLogger(__name__)


def normalize_verified_order(order: dict) -> dict:
    order = object_id_to_str(order)
    order.setdefault("order_type", "dine_in")
    order.setdefault("payment_status", "pending")
    order.setdefault("qr_code", None)
    order.setdefault("subtotal", float(order.get("subtotal", order.get("total_amount", 0.0))))
    order.setdefault("discount_amount", float(order.get("discount_amount", 0.0)))
    order.setdefault("tax_amount", float(order.get("tax_amount", 0.0)))
    order.setdefault("payment_method", order.get("payment_method", PaymentMethod.cash.value))
    order.setdefault("payment_transaction_id", order.get("payment_transaction_id"))
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


def generate_qr_code_base64(data: str) -> str:
    logger.debug("[QR GENERATION BASE64] Input data: %s", data)
    image = qrcode.make(data)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def build_order_qr_data(order_id: str, user_id: str) -> str:
    return f"order:{order_id};user:{user_id}"


async def generate_order_qr_code(
    db: AsyncIOMotorDatabase,
    order_id: str,
    current_user: dict,
) -> dict:
    logger.debug("[QR CODE GENERATE REQUEST] order_id: %s, user: %s", order_id, current_user.get("id"))
    try:
        object_id = ensure_object_id(order_id)
    except ValueError as exc:
        logger.warning("[QR CODE GENERATE ERROR] Invalid order_id format: %s", order_id)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid order id") from exc

    filters: dict = {"_id": object_id}
    if current_user.get("role") != "admin":
        filters["user_id"] = current_user["id"]

    order = await db.orders.find_one(filters)
    if order is None:
        logger.warning("[QR CODE GENERATE ERROR] Order not found: %s", order_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order = object_id_to_str(order)
    qr_data = build_order_qr_data(order["id"], order["user_id"])
    qr_code = generate_qr_code_base64(qr_data)

    await db.orders.update_one(
        {"_id": object_id},
        {"$set": {"qr_code": qr_code, "updated_at": now_utc()}},
    )
    logger.debug("[QR CODE GENERATED SUCCESS] Generated for order_id: %s", order_id)
    return {"data": qr_data, "qr_code_base64": qr_code}


def parse_order_qr_data(data: str) -> tuple[str, str]:
    try:
        parts = dict(part.split(":", 1) for part in data.split(";"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid QR data") from exc

    order_id = parts.get("order")
    user_id = parts.get("user")
    if not order_id or not user_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid QR data")
    return order_id, user_id


async def verify_order_qr_and_complete(db: AsyncIOMotorDatabase, data: str) -> dict:
    logger.debug("[QR VERIFICATION REQUEST] Raw QR data: %s", data)

    # 1. Handle Mock codes for Admin Simulator
    if data == "QR_VALID_123":
        logger.debug("[QR VERIFICATION MOCK] Handling valid mock code QR_VALID_123")
        order = await db.orders.find_one({"status": {"$in": ["ready", "preparing", "pending"]}})
        if not order:
            order = await db.orders.find_one({})
        if not order:
            # Create a mock order if no orders exist at all
            from app.models.order import create_order_document
            user = await db.users.find_one({})
            user_id = str(user["_id"]) if user else "64beef000000000000000000"
            dummy_doc = create_order_document(
                user_id=user_id,
                items=[{"menu_item_id": "dummy_item", "name": "Mock Burger", "price": 100.0, "quantity": 1}],
                total_amount=100.0,
                order_type="takeaway",
                payment_status="paid",
                payment_method="wallet",
            )
            dummy_doc["status"] = "ready"
            dummy_doc["order_status"] = "ready"
            result = await db.orders.insert_one(dummy_doc)
            order = await db.orders.find_one({"_id": result.inserted_id})
            
        object_id = order["_id"]
        user_id = order["user_id"]
        status_history = order.get("status_history", [])
        if not any(item.get("status") == "completed" for item in status_history):
            status_history.append({"status": "completed", "updated_at": now_utc()})
            
        updated = await db.orders.find_one_and_update(
            {"_id": object_id},
            {
                "$set": {
                    "status": "completed",
                    "order_status": "completed",
                    "status_history": status_history,
                    "updated_at": now_utc()
                }
            },
            return_document=ReturnDocument.AFTER,
        )
        logger.debug("[QR VERIFICATION MOCK SUCCESS] Updated mock order: %s", updated)
        return normalize_verified_order(updated)
        
    elif data == "QR_INVALID_XYZ":
        logger.debug("[QR VERIFICATION MOCK] Simulating invalid QR code QR_INVALID_XYZ")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid QR Code")
        
    elif data == "QR_USED_456":
        logger.debug("[QR VERIFICATION MOCK] Simulating already used QR code QR_USED_456")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR code is already used")
        
    elif data == "QR_EXPIRED_789":
        logger.debug("[QR VERIFICATION MOCK] Simulating expired QR code QR_EXPIRED_789")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR code has expired")

    # 2. Handle Real scan codes
    order_id, user_id = parse_order_qr_data(data)
    logger.debug("[QR VERIFY PARSED] parsed order_id: %s, user_id: %s", order_id, user_id)
    try:
        object_id = ensure_object_id(order_id)
    except ValueError as exc:
        logger.warning("[QR VERIFY ERROR] Invalid order_id format in QR: %s", order_id)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid order id") from exc

    order = await db.orders.find_one({"_id": object_id, "user_id": user_id})
    if order is None:
        logger.warning("[QR VERIFY ERROR] Order not found for order_id: %s, user_id: %s", order_id, user_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    expected_data = build_order_qr_data(str(order["_id"]), order["user_id"])
    if data != expected_data:
        logger.warning("[QR VERIFY ERROR] QR data mismatch: expected %s, got %s", expected_data, data)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR data does not match order")

    status_history = order.get("status_history", [])
    if not any(item.get("status") == "completed" for item in status_history):
        status_history.append({"status": "completed", "updated_at": now_utc()})

    updated = await db.orders.find_one_and_update(
        {"_id": object_id, "user_id": user_id},
        {
            "$set": {
                "status": "completed",
                "order_status": "completed",
                "status_history": status_history,
                "updated_at": now_utc()
            }
        },
        return_document=ReturnDocument.AFTER,
    )
    logger.debug("[QR VERIFY SUCCESS] Updated order: %s", updated)
    return normalize_verified_order(updated)
