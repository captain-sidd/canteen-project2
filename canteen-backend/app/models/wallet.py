from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.models.base import now_utc


def create_wallet_document(user_id: str) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "balance": 0.0,
        "wallet_pin_hash": None,
        "is_wallet_active": False,
        "wallet_id": f"WALLET-{uuid4().hex[:12].upper()}",
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }


def wallet_public_fields(wallet: dict[str, Any]) -> dict[str, Any]:
    return {
        "wallet_id": wallet.get("wallet_id"),
        "user_id": wallet.get("user_id"),
        "balance": float(wallet.get("balance", 0.0)),
        "is_wallet_active": bool(wallet.get("is_wallet_active", False)),
        "created_at": wallet.get("created_at"),
        "updated_at": wallet.get("updated_at"),
    }
