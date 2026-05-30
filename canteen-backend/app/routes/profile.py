from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.user import UserResponse, UserUpdate
from app.services import auth_service


router = APIRouter()


@router.get("", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)) -> dict:
    return auth_service.user_public_fields(current_user)


@router.put("", response_model=UserResponse)
async def update_profile(
    payload: UserUpdate,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await auth_service.update_user_profile(get_database(), current_user["id"], payload)