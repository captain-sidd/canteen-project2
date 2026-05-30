from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.enums import WalletTransactionType


class WalletTransactionBase(BaseModel):
    user_id: str
    type: WalletTransactionType
    amount: float = Field(gt=0)
    status: str = Field(default="success")
    source: str = Field(min_length=1)
    description: str | None = None
    reference_id: str | None = None
    balance_after_transaction: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WalletTransactionCreate(WalletTransactionBase):
    pass


class WalletTransactionResponse(WalletTransactionBase):
    id: str
