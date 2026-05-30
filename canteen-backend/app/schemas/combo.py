from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field, field_validator


class ComboItem(BaseModel):
    menu_item_id: str
    quantity: int = Field(default=1, gt=0)


class ComboBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    items: list[ComboItem | str] = Field(min_length=1)
    combo_price: float = Field(gt=0)
    original_price: float | None = None
    discount_percentage: float | None = Field(default=None, ge=0, le=100)
    image_url: str | None = Field(default=None, max_length=512)
    is_available: bool = True
    is_featured: bool = False
    is_trending: bool = False
    is_special: bool = False
    rating: float = 0.0
    tags: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("items", mode="before")
    @classmethod
    def normalize_items(cls, value: list[Any]) -> list[Any]:
        if value is None:
            return []
        normalized: list[Any] = []
        for item in value:
            if isinstance(item, str):
                normalized.append({"menu_item_id": item, "quantity": 1})
            else:
                normalized.append(item)
        return normalized


class ComboCreate(ComboBase):
    pass


class ComboUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    items: list[ComboItem | str] | None = Field(default=None, min_length=1)
    combo_price: float | None = Field(default=None, gt=0)
    original_price: float | None = None
    discount_percentage: float | None = Field(default=None, ge=0, le=100)
    image_url: str | None = Field(default=None, max_length=512)
    is_available: bool | None = None
    is_featured: bool | None = None
    is_trending: bool | None = None
    is_special: bool | None = None
    rating: float | None = None
    tags: list[str] | None = None
    updated_at: datetime | None = None


class ComboResponse(ComboBase):
    id: str
