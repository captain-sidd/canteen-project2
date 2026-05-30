from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.models.base import now_utc


def create_wallet_transaction_document(
    user_id: str,
    type: str,
    amount: float,
    source: str,
    status: str = "success",
    description: str | None = None,
    reference_id: str | None = None,
    balance_after_transaction: float = 0.0,
) -> dict[str, Any]:
    return {
        "transaction_id": f"WALLET-TX-{uuid4().hex[:12].upper()}",
        "user_id": user_id,
        "type": type,
        "amount": amount,
        "status": status,
        "source": source,
        "description": description,
        "reference_id": reference_id,
        "balance_after_transaction": balance_after_transaction,
        "created_at": now_utc(),
    }
