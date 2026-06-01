from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.models.base import ensure_object_id, now_utc, object_id_to_str
from app.models.menu_item import create_menu_item_document
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate


async def create_menu_item(db: AsyncIOMotorDatabase, payload: MenuItemCreate) -> dict:
    document = create_menu_item_document(**payload.model_dump(exclude={"created_at", "updated_at"}, mode="json"))
    result = await db.menu_items.insert_one(document)
    return object_id_to_str({**document, "_id": result.inserted_id})


async def list_menu_items(
    db: AsyncIOMotorDatabase,
    category: str | None = None,
    available_only: bool = True,
    veg: bool | None = None,
    trending: bool | None = None,
    special: bool | None = None,
    featured: bool | None = None,
    sort_by: str = "name",
) -> list[dict]:
    filters: dict = {}
    if category:
        filters["category"] = category
    if available_only:
        filters["is_available"] = True
    if veg is not None:
        filters["is_veg"] = veg
    if trending is not None:
        filters["is_trending"] = trending
    if special is not None:
        filters["is_special"] = special
    if featured is not None:
        filters["is_featured"] = featured

    sort_field = "name"
    if sort_by == "price":
        sort_field = "price"
    elif sort_by == "rating":
        sort_field = "rating"

    cursor = db.menu_items.find(filters).sort(sort_field, 1)
    return [object_id_to_str(item) async for item in cursor]


async def get_trending_menu_items(db: AsyncIOMotorDatabase, limit: int = 10) -> list[dict]:
    cursor = db.menu_items.find({"is_trending": True, "is_available": True}).limit(limit).sort("name", 1)
    return [object_id_to_str(item) async for item in cursor]


async def get_special_menu_items(db: AsyncIOMotorDatabase, limit: int = 10) -> list[dict]:
    cursor = db.menu_items.find({"is_special": True, "is_available": True}).limit(limit).sort("name", 1)
    return [object_id_to_str(item) async for item in cursor]


async def get_featured_menu_items(db: AsyncIOMotorDatabase, limit: int = 10) -> list[dict]:
    cursor = db.menu_items.find({"is_featured": True, "is_available": True}).limit(limit).sort("name", 1)
    return [object_id_to_str(item) async for item in cursor]


async def get_menu_item(db: AsyncIOMotorDatabase, item_id: str) -> dict:
    try:
        object_id = ensure_object_id(item_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid menu item id",
        ) from exc

    item = await db.menu_items.find_one({"_id": object_id})
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    return object_id_to_str(item)


async def update_menu_item(db: AsyncIOMotorDatabase, item_id: str, payload: MenuItemUpdate) -> dict:
    try:
        object_id = ensure_object_id(item_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid menu item id",
        ) from exc

    update_data = payload.model_dump(exclude_unset=True, mode="json")
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    update_data["updated_at"] = now_utc()

    item = await db.menu_items.find_one_and_update(
        {"_id": object_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    return object_id_to_str(item)


async def delete_menu_item(db: AsyncIOMotorDatabase, item_id: str) -> None:
    try:
        object_id = ensure_object_id(item_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid menu item id",
        ) from exc

    result = await db.menu_items.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
