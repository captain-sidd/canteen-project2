from datetime import datetime, timezone
from typing import Any

from app.models.base import now_utc


def create_user_document(
    email: str,
    password: str,
    name: str | None = None,
    role: str = "customer",
    phone: str | None = None,
    profile_image: str | None = None,
) -> dict[str, Any]:
    return {
        "name": name,
        "email": email.lower(),
        "password": password,
        "role": role,
        "phone": phone,
        "profile_image": profile_image,
        "wallet_balance": 0.0,
        "is_active": True,
        "is_verified": False,
        "last_login": None,
        "favorites": [],
        "addresses": [],
        "preferences": {},
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }


def user_public_fields(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(user.get("_id", user.get("id"))),
        "name": user.get("name") or user.get("full_name"),
        "email": user["email"],
        "phone": user.get("phone"),
        "profile_image": user.get("profile_image"),
        "role": user.get("role", "customer"),
        "wallet_balance": float(user.get("wallet_balance", 0.0)),
        "is_active": user.get("is_active", True),
        "is_verified": user.get("is_verified", False),
        "last_login": user.get("last_login"),
        "favorites": user.get("favorites", []),
        "addresses": user.get("addresses", []),
        "preferences": user.get("preferences", {}),
        "created_at": user.get("created_at", datetime.now(timezone.utc)),
        "updated_at": user.get("updated_at", datetime.now(timezone.utc)),
    }
