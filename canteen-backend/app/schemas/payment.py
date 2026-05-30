from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field, constr


class OrderItemPayload(BaseModel):
    menu_item_id: str
    quantity: int = Field(gt=0)


class WalletPaymentRequest(BaseModel):
    order_items: list[OrderItemPayload] = Field(min_length=1)
    offer_code: str | None = None
    wallet_pin: constr(min_length=4, max_length=4, pattern=r"^[0-9]{4}$")
    notes: str | None = None


class UPIPaymentRequest(BaseModel):
    order_items: list[OrderItemPayload] = Field(min_length=1)
    offer_code: str | None = None
    upi_id: str = Field(min_length=5)
    notes: str | None = None


class CheckoutItemSummary(BaseModel):
    menu_item_id: str
    name: str
    unit_price: float
    regular_price: float
    quantity: int
    item_discount: float
    total_price: float
    is_offer_active: bool
    offer_tag: str | None = None


class OfferSummary(BaseModel):
    code: str
    title: str | None = None
    description: str | None = None
    discount_type: str
    discount_value: float
    max_discount: float | None = None
    min_order_amount: float | None = None
    is_active: bool
    expiry_date: datetime | None = None


class CheckoutSummaryRequest(BaseModel):
    items: list[OrderItemPayload] = Field(min_length=1)
    offer_code: str | None = None


class CheckoutSummaryResponse(BaseModel):
    subtotal: float
    item_discount: float
    offer_discount: float
    tax_amount: float
    final_total: float
    applied_offer: OfferSummary | None = None
    items: list[CheckoutItemSummary]


class PaymentResponse(BaseModel):
    payment_id: str
    user_id: str
    payment_method: str
    amount: float
    status: str
    transaction_reference: str | None = None
    created_at: datetime
    updated_at: datetime
    metadata: dict[str, Any] = Field(default_factory=dict)


class WalletPaymentResponse(BaseModel):
    payment: PaymentResponse
    wallet_balance: float
    wallet_transaction: dict[str, Any]


class UPIPaymentResponse(BaseModel):
    payment: PaymentResponse
    status: str  # "success" or "failed"


class PaymentHistoryResponse(BaseModel):
    items: list[PaymentResponse]
    page: int
    limit: int
    total: int
    has_more: bool
