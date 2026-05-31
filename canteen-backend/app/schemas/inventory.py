from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class InventoryCreate(BaseModel):
    item_name: str = Field(..., example="Tomatoes")
    item_code: str = Field(..., example="TOM-001")
    category: str = Field(..., example="Vegetables")
    stock_quantity: float = Field(..., ge=0, example=50)
    min_stock: float = Field(..., ge=0, example=10)
    max_stock: Optional[float] = Field(None, ge=0, example=100)
    unit: str = Field(..., example="kg")
    supplier_name: Optional[str] = Field(None, example="Farm Fresh")
    supplier_contact: Optional[str] = Field(None, example="1234567890")
    purchase_price: Optional[float] = Field(None, ge=0, example=40.0)
    selling_price: Optional[float] = Field(None, ge=0, example=50.0)
    expiry_date: Optional[datetime] = None


class InventoryUpdate(BaseModel):
    item_name: Optional[str] = None
    item_code: Optional[str] = None
    category: Optional[str] = None
    stock_quantity: Optional[float] = Field(None, ge=0)
    min_stock: Optional[float] = Field(None, ge=0)
    max_stock: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    expiry_date: Optional[datetime] = None


class InventoryResponse(InventoryCreate):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime


class PaginatedInventoryResponse(BaseModel):
    items: list[InventoryResponse]
    total: int
    page: int
    limit: int
    pages: int
