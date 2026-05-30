from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field, constr


class WalletPinRequest(BaseModel):
    new_pin: constr(min_length=4, max_length=4, pattern=r"^[0-9]{4}$")
    confirm_pin: constr(min_length=4, max_length=4, pattern=r"^[0-9]{4}$")
    account_password: str = Field(min_length=8)


class WalletPinChangeRequest(BaseModel):
    current_pin: constr(min_length=4, max_length=4, pattern=r"^[0-9]{4}$")
    new_pin: constr(min_length=4, max_length=4, pattern=r"^[0-9]{4}$")
    confirm_pin: constr(min_length=4, max_length=4, pattern=r"^[0-9]{4}$")
    account_password: str = Field(min_length=8)


class WalletDetailsResponse(BaseModel):
    balance: float
    is_wallet_active: bool
    wallet_id: str | None = None


class WalletTopUpRequest(BaseModel):
    amount: float = Field(gt=0)
    payment_method: str = Field(min_length=1)
    description: str | None = None


class WalletTopUpResponse(BaseModel):
    balance: float
    wallet_id: str | None = None


class WalletTransactionItem(BaseModel):
    id: str
    type: str
    amount: float
    description: str | None = None
    reference_id: str | None = None
    balance_after_transaction: float
    created_at: datetime
