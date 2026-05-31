from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database.mongodb import get_database
from app.models.base import now_utc
from app.models.inventory import calculate_status, create_inventory_document, inventory_public_fields
from app.core.dependencies import get_current_user
from app.schemas.inventory import InventoryCreate, InventoryResponse, InventoryUpdate, PaginatedInventoryResponse

router = APIRouter()


@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    item_in: InventoryCreate,
    db: Any = Depends(get_database),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> Any:
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    existing = await db.inventory.find_one({"item_code": item_in.item_code})
    if existing:
        raise HTTPException(status_code=400, detail="Item code already exists")

    doc = create_inventory_document(**item_in.model_dump())
    result = await db.inventory.insert_one(doc)
    doc["_id"] = result.inserted_id
    return inventory_public_fields(doc)


@router.get("", response_model=PaginatedInventoryResponse)
async def list_inventory(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    db: Any = Depends(get_database),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> Any:
    query: dict[str, Any] = {}
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"item_name": search_regex},
            {"item_code": search_regex},
            {"category": search_regex},
        ]

    skip = (page - 1) * limit
    total = await db.inventory.count_documents(query)

    cursor = db.inventory.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = []
    async for doc in cursor:
        items.append(inventory_public_fields(doc))

    pages = (total + limit - 1) // limit

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
    }


@router.get("/{id}", response_model=InventoryResponse)
async def get_inventory_item(
    id: str,
    db: Any = Depends(get_database),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> Any:
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    doc = await db.inventory.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")

    return inventory_public_fields(doc)


@router.patch("/{id}", response_model=InventoryResponse)
async def update_inventory_item(
    id: str,
    item_in: InventoryUpdate,
    db: Any = Depends(get_database),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> Any:
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    doc = await db.inventory.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = item_in.model_dump(exclude_unset=True)
    if update_data:
        if "item_code" in update_data and update_data["item_code"] != doc.get("item_code"):
            existing = await db.inventory.find_one({"item_code": update_data["item_code"]})
            if existing:
                raise HTTPException(status_code=400, detail="Item code already exists")

        # Handle status recalculation if stock_quantity or min_stock changes
        stock = update_data.get("stock_quantity", doc.get("stock_quantity", 0))
        min_stock = update_data.get("min_stock", doc.get("min_stock", 0))
        if "stock_quantity" in update_data or "min_stock" in update_data:
            update_data["status"] = calculate_status(stock, min_stock)

        update_data["updated_at"] = now_utc()

        await db.inventory.update_one({"_id": ObjectId(id)}, {"$set": update_data})

    updated_doc = await db.inventory.find_one({"_id": ObjectId(id)})
    if not updated_doc:
        raise HTTPException(status_code=404, detail="Item not found after update")
    return inventory_public_fields(updated_doc)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inventory_item(
    id: str,
    db: Any = Depends(get_database),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> None:
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    result = await db.inventory.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
