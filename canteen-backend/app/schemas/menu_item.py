from datetime import datetime, timezone

from pydantic import BaseModel, Field, HttpUrl


class MenuItemBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    price: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=80)
    slug: str | None = Field(default=None, max_length=120)
    subcategory: str | None = Field(default=None, max_length=80)
    image_url: HttpUrl | None = None
    gallery_images: list[str] = Field(default_factory=list)
    currency: str = "INR"
    discount_price: float | None = None
    is_available: bool = True
    is_veg: bool | None = None
    is_featured: bool = False
    is_trending: bool = False
    is_special: bool = False
    rating: float = 0.0
    rating_count: int = 0
    preparation_time: int | None = None
    stock_quantity: int | None = None
    calories: int | None = None
    tags: list[str] = Field(default_factory=list)
    ingredients: list[str] = Field(default_factory=list)
    allergens: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    price: float | None = Field(default=None, gt=0)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    slug: str | None = Field(default=None, max_length=120)
    subcategory: str | None = Field(default=None, max_length=80)
    image_url: HttpUrl | None = None
    gallery_images: list[str] | None = None
    currency: str | None = None
    discount_price: float | None = None
    is_available: bool | None = None
    is_veg: bool | None = None
    is_featured: bool | None = None
    is_trending: bool | None = None
    is_special: bool | None = None
    rating: float | None = None
    rating_count: int | None = None
    preparation_time: int | None = None
    stock_quantity: int | None = None
    calories: int | None = None
    tags: list[str] | None = None
    ingredients: list[str] | None = None
    allergens: list[str] | None = None
    updated_at: datetime | None = None


class MenuItemResponse(MenuItemBase):
    id: str
