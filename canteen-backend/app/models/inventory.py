from datetime import datetime
from typing import Any

from app.models.base import now_utc


def calculate_status(stock_quantity: float, min_stock: float) -> str:
    if stock_quantity == 0:
        return "out_of_stock"
    if stock_quantity <= min_stock:
        return "low_stock"
    return "available"


def create_inventory_document(
    item_name: str,
    item_code: str,
    category: str,
    stock_quantity: float,
    min_stock: float,
    unit: str,
    max_stock: float | None = None,
    supplier_name: str | None = None,
    supplier_contact: str | None = None,
    purchase_price: float | None = None,
    selling_price: float | None = None,
    expiry_date: datetime | None = None,
) -> dict[str, Any]:
    return {
        "item_name": item_name,
        "item_code": item_code,
        "category": category,
        "stock_quantity": stock_quantity,
        "min_stock": min_stock,
        "max_stock": max_stock,
        "unit": unit,
        "supplier_name": supplier_name,
        "supplier_contact": supplier_contact,
        "purchase_price": purchase_price,
        "selling_price": selling_price,
        "expiry_date": expiry_date,
        "status": calculate_status(stock_quantity, min_stock),
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }


def inventory_public_fields(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(item.get("_id", item.get("id"))),
        "item_name": item.get("item_name"),
        "item_code": item.get("item_code"),
        "category": item.get("category"),
        "stock_quantity": float(item.get("stock_quantity", 0)),
        "min_stock": float(item.get("min_stock", 0)),
        "max_stock": float(item.get("max_stock", 0)) if item.get("max_stock") is not None else None,
        "unit": item.get("unit"),
        "supplier_name": item.get("supplier_name"),
        "supplier_contact": item.get("supplier_contact"),
        "purchase_price": float(item.get("purchase_price")) if item.get("purchase_price") is not None else None,
        "selling_price": float(item.get("selling_price")) if item.get("selling_price") is not None else None,
        "expiry_date": item.get("expiry_date"),
        "status": item.get("status", calculate_status(item.get("stock_quantity", 0), item.get("min_stock", 0))),
        "created_at": item.get("created_at", now_utc()),
        "updated_at": item.get("updated_at", now_utc()),
    }
