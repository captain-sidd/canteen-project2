from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.models.base import now_utc


ORDER_STATUSES = {"pending", "preparing", "ready", "completed", "cancelled"}


def create_order_document(
    user_id: str,
    items: list[dict[str, Any]],
    total_amount: float,
    order_type: str,
    qr_code: str | None = None,
    payment_status: str = "pending",
    payment_method: str = "cash",
    notes: str | None = None,
    payment_id: str | None = None,
    payment_transaction_id: str | None = None,
    wallet_transaction_id: str | None = None,
    subtotal: float | None = None,
    tax_amount: float = 0.0,
    discount_amount: float = 0.0,
) -> dict[str, Any]:
    if hasattr(order_type, "value"):
        order_type = order_type.value
    if hasattr(payment_status, "value"):
        payment_status = payment_status.value
    if hasattr(payment_method, "value"):
        payment_method = payment_method.value

    order_number = f"ORD-{uuid4().hex[:10].upper()}"
    calculated_subtotal = subtotal if subtotal is not None else total_amount
    return {
        "user_id": user_id,
        "items": items,
        "total_amount": total_amount,
        "subtotal": calculated_subtotal,
        "discount_amount": discount_amount,
        "tax_amount": tax_amount,
        "order_number": order_number,
        "status": "pending",
        "order_status": "pending",
        "order_type": order_type,
        "qr_code": qr_code,
        "payment_status": payment_status,
        "payment_method": payment_method,
        "payment_id": payment_id,
        "payment_transaction_id": payment_transaction_id,
        "wallet_transaction_id": wallet_transaction_id,
        "estimated_ready_time": None,
        "receipt_url": None,
        "notes": notes,
        "status_history": [{"status": "pending", "updated_at": now_utc()}],
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
