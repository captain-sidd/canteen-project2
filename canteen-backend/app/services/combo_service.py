from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.models.base import ensure_object_id, now_utc, object_id_to_str
from app.models.combo import create_combo_document, normalize_combo_items
from app.schemas.combo import ComboCreate, ComboUpdate


async def create_combo(db: AsyncIOMotorDatabase, payload: ComboCreate) -> dict:
    # Validate menu items exist
    for item in payload.items:
        if isinstance(item, dict):
            menu_item_id = item.get("menu_item_id")
        else:
            menu_item_id = item
        try:
            object_id = ensure_object_id(menu_item_id)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid menu item id: {menu_item_id}",
            ) from exc
        menu_item = await db.menu_items.find_one({"_id": object_id, "is_available": True})
        if menu_item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item not found or unavailable: {menu_item_id}",
            )

    document = create_combo_document(**payload.model_dump(mode="json"))
    result = await db.combos.insert_one(document)
    return object_id_to_str({**document, "_id": result.inserted_id})


async def list_combos(
    db: AsyncIOMotorDatabase,
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    featured: bool | None = None,
    trending: bool | None = None,
) -> dict:
    filters: dict = {}
    if search:
        filters["name"] = {"$regex": search, "$options": "i"}
    if featured is not None:
        filters["is_featured"] = featured
    if trending is not None:
        filters["is_trending"] = trending

    skip = (page - 1) * limit
    cursor = db.combos.find(filters).skip(skip).limit(limit).sort("name", 1)
    
    items: list[dict] = []
    async for combo in cursor:
        try:
            items.append(object_id_to_str(combo))
        except Exception:
            # Skip invalid items
            pass

    total = await db.combos.count_documents(filters)
    has_more = (page * limit) < total

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "has_more": has_more,
    }


async def get_combo(db: AsyncIOMotorDatabase, combo_id: str) -> dict:
    try:
        object_id = ensure_object_id(combo_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid combo id",
        ) from exc

    combo = await db.combos.find_one({"_id": object_id})
    if combo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Combo not found")
    return object_id_to_str(combo)


async def update_combo(db: AsyncIOMotorDatabase, combo_id: str, payload: ComboUpdate) -> dict:
    try:
        object_id = ensure_object_id(combo_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid combo id",
        ) from exc

    update_data = payload.model_dump(exclude_unset=True, mode="json")
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    update_data["updated_at"] = now_utc()

    combo = await db.combos.find_one_and_update(
        {"_id": object_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    if combo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Combo not found")
    return object_id_to_str(combo)


async def delete_combo(db: AsyncIOMotorDatabase, combo_id: str) -> None:
    try:
        object_id = ensure_object_id(combo_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid combo id",
        ) from exc

    result = await db.combos.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Combo not found")


async def get_featured_combos(db: AsyncIOMotorDatabase, limit: int = 10) -> list[dict]:
    cursor = db.combos.find({"is_featured": True, "is_available": True}).limit(limit).sort("name", 1)
    featured: list[dict] = []
    async for combo in cursor:
        try:
            featured.append(object_id_to_str(combo))
        except Exception:
            pass
    return featured


async def get_trending_combos(db: AsyncIOMotorDatabase, limit: int = 10) -> list[dict]:
    cursor = db.combos.find({"is_trending": True, "is_available": True}).limit(limit).sort("name", 1)
    trending: list[dict] = []
    async for combo in cursor:
        try:
            trending.append(object_id_to_str(combo))
        except Exception:
            pass
    return trending