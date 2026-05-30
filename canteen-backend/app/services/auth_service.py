from datetime import timedelta

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError
from pymongo import ReturnDocument

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.base import ensure_object_id, now_utc, object_id_to_str
from app.models.user import create_user_document, user_public_fields
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserUpdate


async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> dict | None:
    user = await db.users.find_one({"email": email.lower()})
    return object_id_to_str(user)


async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> dict | None:
    try:
        object_id = ensure_object_id(user_id)
    except ValueError:
        return None

    user = await db.users.find_one({"_id": object_id})
    return object_id_to_str(user)


async def list_users(db: AsyncIOMotorDatabase) -> list[dict]:
    cursor = db.users.find({}).sort("created_at", -1)
    users = [object_id_to_str(user) async for user in cursor]
    return [user_public_fields(user) for user in users]


async def register_user(db: AsyncIOMotorDatabase, payload: RegisterRequest) -> TokenResponse:
    document = create_user_document(
        email=payload.email,
        password=get_password_hash(payload.password),
        name=payload.name or payload.full_name,
        role=payload.role,
        phone=payload.phone,
        profile_image=payload.profile_image,
    )

    try:
        result = await db.users.insert_one(document)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        ) from exc

    created_user = object_id_to_str({**document, "_id": result.inserted_id})
    return build_token_response(created_user)


async def authenticate_user(db: AsyncIOMotorDatabase, payload: LoginRequest) -> TokenResponse:
    user = await get_user_by_email(db, payload.email)
    stored_password = None if user is None else user.get("password") or user.get("hashed_password")
    if user is None or stored_password is None or not verify_password(payload.password, stored_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    try:
        object_id = ensure_object_id(user["id"])
        await db.users.update_one(
            {"_id": object_id},
            {"$set": {"last_login": now_utc(), "updated_at": now_utc()}},
        )
    except ValueError:
        pass

    return build_token_response(user)


def build_token_response(user: dict) -> TokenResponse:
    access_token = create_access_token(
        subject=user["id"],
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(access_token=access_token, user=user_public_fields(user))


async def update_user_profile(db: AsyncIOMotorDatabase, user_id: str, payload: UserUpdate) -> dict:
    try:
        object_id = ensure_object_id(user_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid user id",
        ) from exc

    update_data = payload.model_dump(exclude_unset=True, mode="json")
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    update_data["updated_at"] = now_utc()

    user = await db.users.find_one_and_update(
        {"_id": object_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user_public_fields(user)
