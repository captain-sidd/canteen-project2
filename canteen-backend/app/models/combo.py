from datetime import datetime, timezone
from typing import Any

from app.models.base import now_utc


def normalize_combo_items(items: list[Any]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for item in items:
        if isinstance(item, str):
            normalized.append({"menu_item_id": item, "quantity": 1})
        elif isinstance(item, dict):
            normalized.append(
                {
                    "menu_item_id": item.get("menu_item_id") or item.get("item_id"),
                    "quantity": int(item.get("quantity", 1)),
                }
            )
        else:
            normalized.append({"menu_item_id": str(item), "quantity": 1})
    return normalized


def create_combo_document(
    name: str,
    items: list[Any],
    combo_price: float,
    description: str | None = None,
    original_price: float | None = None,
    discount_percentage: float | None = None,
    image_url: str | None = None,
    is_available: bool = True,
    is_featured: bool = False,
    is_trending: bool = False,
    is_special: bool = False,
    rating: float = 0.0,
    tags: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "name": name,
        "description": description,
        "items": normalize_combo_items(items),
        "combo_price": combo_price,
        "original_price": original_price,
        "discount_percentage": discount_percentage,
        "image_url": image_url,
        "is_available": is_available,
        "is_featured": is_featured,
        "is_trending": is_trending,
        "is_special": is_special,
        "rating": rating,
        "tags": tags or [],
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
