from datetime import datetime, timezone
from typing import Any

from app.models.base import now_utc


def create_offer_document(
    code: str,
    title: str,
    description: str | None,
    discount_type: str,
    discount_value: float,
    max_discount: float | None = None,
    min_order_amount: float | None = None,
    is_active: bool = True,
    expiry_date: datetime | None = None,
    banner_image: str | None = None,
    applicable_on: str = "all",
) -> dict[str, Any]:
    return {
        "code": code.strip().upper(),
        "title": title,
        "description": description,
        "banner_image": banner_image,
        "discount_type": discount_type,
        "discount_value": discount_value,
        "max_discount": max_discount,
        "min_order_amount": min_order_amount,
        "applicable_on": applicable_on,
        "is_active": is_active,
        "expiry_date": expiry_date,
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
