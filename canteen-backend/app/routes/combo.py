from fastapi import APIRouter, Depends, Query

# TODO: Restore admin RBAC after demo
from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.combo import ComboCreate, ComboResponse
from app.services import combo_service


router = APIRouter()


@router.post("", response_model=ComboResponse, status_code=201)
async def create_combo(
    payload: ComboCreate,
    _: dict = Depends(get_current_user),
) -> dict:
    return await combo_service.create_combo(get_database(), payload)


@router.get("", response_model=dict)
async def list_combos(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    search: str | None = Query(None),
    featured: bool | None = Query(None),
    trending: bool | None = Query(None),
) -> dict:
    return await combo_service.list_combos(
        get_database(), page, limit, search, featured, trending
    )


@router.get("/featured", response_model=list[ComboResponse])
async def get_featured_combos(limit: int = Query(10, ge=1, le=50)) -> list[dict]:
    return await combo_service.get_featured_combos(get_database(), limit)


@router.get("/trending", response_model=list[ComboResponse])
async def get_trending_combos(limit: int = Query(10, ge=1, le=50)) -> list[dict]:
    return await combo_service.get_trending_combos(get_database(), limit)


@router.get("/{combo_id}", response_model=ComboResponse)
async def get_combo(combo_id: str) -> dict:
    return await combo_service.get_combo(get_database(), combo_id)


@router.patch("/{combo_id}", response_model=ComboResponse)
async def update_combo(
    combo_id: str,
    payload: ComboCreate,
    _: dict = Depends(get_current_user),
) -> dict:
    return await combo_service.update_combo(get_database(), combo_id, payload)


@router.delete("/{combo_id}", status_code=204)
async def delete_combo(
    combo_id: str,
    _: dict = Depends(get_current_user),
) -> None:
    await combo_service.delete_combo(get_database(), combo_id)