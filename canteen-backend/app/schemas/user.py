from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, EmailStr, Field

from app.schemas.enums import UserRole


class UserBase(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    profile_image: str | None = Field(default=None, max_length=512)
    role: UserRole = UserRole.customer
    wallet_balance: float = 0.0
    is_active: bool = True
    is_verified: bool = False
    last_login: datetime | None = None
    favorites: list[str] = Field(default_factory=list)
    addresses: list[dict[str, Any]] = Field(default_factory=list)
    preferences: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)
    role: UserRole | None = None
    phone: str | None = Field(default=None, max_length=20)
    profile_image: str | None = Field(default=None, max_length=512)
    wallet_balance: float | None = None
    is_active: bool | None = None
    is_verified: bool | None = None
    last_login: datetime | None = None
    favorites: list[str] | None = None
    addresses: list[dict[str, Any]] | None = None
    preferences: dict[str, Any] | None = None
    updated_at: datetime | None = None


class UserInDB(UserBase):
    id: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str | None = None
    email: EmailStr
    phone: str | None = None
    profile_image: str | None = None
    role: UserRole = UserRole.customer
    wallet_balance: float = 0.0
    is_active: bool = True
    is_verified: bool = False
    last_login: datetime | None = None
    favorites: list[str] = Field(default_factory=list)
    addresses: list[dict[str, Any]] = Field(default_factory=list)
    preferences: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
