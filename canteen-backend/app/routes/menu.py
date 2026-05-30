from fastapi import APIRouter, Depends, Query

# TODO: Restore admin RBAC after demo
from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.menu_item import MenuItemCreate, MenuItemResponse, MenuItemUpdate
from app.services import menu_service


router = APIRouter()


@router.post("", response_model=MenuItemResponse, status_code=201)
async def create_menu_item(
    payload: MenuItemCreate,
    _: dict = Depends(get_current_user),
) -> dict:
    return await menu_service.create_menu_item(get_database(), payload)


@router.get("", response_model=list[MenuItemResponse])
async def list_menu_items(
    category: str | None = None,
    available_only: bool = True,
    veg: bool | None = None,
    trending: bool | None = None,
    special: bool | None = None,
    featured: bool | None = None,
    sort_by: str = "name",
) -> list[dict]:
    return await menu_service.list_menu_items(
        get_database(), category, available_only, veg, trending, special, featured, sort_by
    )


@router.get("/trending", response_model=list[MenuItemResponse])
async def get_trending_menu_items(limit: int = Query(10, ge=1, le=50)) -> list[dict]:
    return await menu_service.get_trending_menu_items(get_database(), limit)


@router.get("/specials", response_model=list[MenuItemResponse])
async def get_special_menu_items(limit: int = Query(10, ge=1, le=50)) -> list[dict]:
    return await menu_service.get_special_menu_items(get_database(), limit)


@router.get("/featured", response_model=list[MenuItemResponse])
async def get_featured_menu_items(limit: int = Query(10, ge=1, le=50)) -> list[dict]:
    return await menu_service.get_featured_menu_items(get_database(), limit)


@router.get("/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(item_id: str) -> dict:
    return await menu_service.get_menu_item(get_database(), item_id)


@router.patch("/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: str,
    payload: MenuItemUpdate,
    _: dict = Depends(get_current_user),
) -> dict:
    return await menu_service.update_menu_item(get_database(), item_id, payload)


@router.delete("/{item_id}", status_code=204)
async def delete_menu_item(
    item_id: str,
    _: dict = Depends(get_current_user),
) -> None:
    await menu_service.delete_menu_item(get_database(), item_id)
