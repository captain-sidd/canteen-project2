from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.models.base import now_utc


def create_payment_document(
    user_id: str,
    payment_method: str,
    amount: float,
    status: str = "pending",
    order_id: str | None = None,
    transaction_reference: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "payment_id": f"PAY-{uuid4().hex[:12].upper()}",
        "user_id": user_id,
        "order_id": order_id,
        "payment_method": payment_method,
        "amount": float(amount),
        "status": status,
        "transaction_reference": transaction_reference,
        "metadata": metadata or {},
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
