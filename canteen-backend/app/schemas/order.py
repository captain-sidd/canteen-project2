from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.enums import OrderStatus, OrderType, PaymentMethod, PaymentStatus


class OrderItemCreate(BaseModel):
    menu_item_id: str
    quantity: int = Field(gt=0)


class OrderItemResponse(BaseModel):
    menu_item_id: str
    name: str
    price: float = Field(gt=0)
    quantity: int


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(min_length=1)
    total_amount: float | None = None
    order_type: OrderType = OrderType.dine_in
    payment_status: PaymentStatus = PaymentStatus.pending
    payment_method: PaymentMethod = PaymentMethod.cash
    payment_id: str | None = None
    notes: str | None = None


class OrderUpdateStatus(BaseModel):
    status: OrderStatus


class OrderResponse(BaseModel):
    id: str
    user_id: str
    order_number: str | None = None
    customer_name: str | None = None
    items: list[OrderItemResponse]
    total_amount: float
    subtotal: float = 0.0
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    order_type: OrderType
    payment_method: PaymentMethod = PaymentMethod.cash
    payment_id: str | None = None
    payment_transaction_id: str | None = None
    wallet_transaction_id: str | None = None
    qr_code: str | None = None
    payment_status: PaymentStatus
    status: OrderStatus
    order_status: OrderStatus = OrderStatus.pending
    estimated_ready_time: datetime | None = None
    receipt_url: str | None = None
    notes: str | None = None
    status_history: list[dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class QRCodeResponse(BaseModel):
    data: str
    qr_code_base64: str


class QRVerifyRequest(BaseModel):
    data: str = Field(min_length=1)


class QRVerifyResponse(BaseModel):
    order: OrderResponse
    message: str = "Order marked as completed"
