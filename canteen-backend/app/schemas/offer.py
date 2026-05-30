from datetime import datetime, timezone

from pydantic import BaseModel, Field

from app.schemas.enums import DiscountType, OfferTarget


class OfferBase(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    title: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    banner_image: str | None = Field(default=None, max_length=512)
    discount_type: DiscountType = DiscountType.percentage
    discount_value: float = Field(default=0.0, gt=0)
    max_discount: float | None = None
    min_order_amount: float | None = None
    applicable_on: OfferTarget = OfferTarget.all
    is_active: bool = True
    expiry_date: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OfferCreate(OfferBase):
    pass


class OfferUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    banner_image: str | None = Field(default=None, max_length=512)
    discount_type: DiscountType | None = None
    discount_value: float | None = Field(default=None, gt=0)
    applicable_on: OfferTarget | None = None
    is_active: bool | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    updated_at: datetime | None = None


class OfferResponse(OfferBase):
    id: str
