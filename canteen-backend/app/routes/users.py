from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.user import UserResponse
from app.services.auth_service import list_users

router = APIRouter()

@router.get("", response_model=list[UserResponse])
async def get_users(_: dict = Depends(get_current_user)) -> list[dict]:
    return await list_users(get_database())
