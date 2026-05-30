from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import verify_password, get_password_hash
from app.models.base import ensure_object_id, now_utc, object_id_to_str
from app.models.wallet import create_wallet_document
from app.schemas.wallet import (
    WalletDetailsResponse,
    WalletPinChangeRequest,
    WalletPinRequest,
    WalletTopUpRequest,
    WalletTopUpResponse,
)
from app.schemas.enums import WalletTransactionType


async def _get_or_create_wallet(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    wallet = await db.wallets.find_one({"user_id": user_id})
    if wallet is None:
        try:
            new_wallet = create_wallet_document(user_id)
            await db.wallets.insert_one(new_wallet)
            wallet = new_wallet
        except Exception:
            # Handle duplicate key race condition
            wallet = await db.wallets.find_one({"user_id": user_id})
    return object_id_to_str(wallet)


async def _ensure_user_exists(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    try:
        object_id = ensure_object_id(user_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid user id",
        ) from exc

    user = await db.users.find_one({"_id": object_id})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return object_id_to_str(user)


async def get_wallet_balance(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    await _ensure_user_exists(db, user_id)
    wallet = await _get_or_create_wallet(db, user_id)
    return {
        "balance": float(wallet.get("balance", 0.0)),
        "wallet_id": wallet.get("wallet_id"),
        "is_wallet_active": bool(wallet.get("is_wallet_active", False)),
    }


async def get_wallet_details(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    await _ensure_user_exists(db, user_id)
    wallet = await _get_or_create_wallet(db, user_id)
    return WalletDetailsResponse(
        balance=float(wallet.get("balance", 0.0)),
        is_wallet_active=bool(wallet.get("is_wallet_active", False)),
        wallet_id=wallet.get("wallet_id"),
    ).model_dump()


async def get_wallet_history(
    db: AsyncIOMotorDatabase,
    user_id: str,
    page: int = 1,
    limit: int = 10,
) -> dict:
    await _ensure_user_exists(db, user_id)
    skip = (page - 1) * limit
    cursor = db.wallet_transactions.find({"user_id": user_id}).skip(skip).limit(limit).sort("created_at", -1)
    items = [object_id_to_str(tx) async for tx in cursor]

    total = await db.wallet_transactions.count_documents({"user_id": user_id})
    has_more = (page * limit) < total

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "has_more": has_more,
    }


async def set_wallet_pin(db: AsyncIOMotorDatabase, user_id: str, current_user: dict, payload: WalletPinRequest) -> dict:
    if payload.new_pin != payload.confirm_pin:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="PIN confirmation does not match")
    if not verify_password(payload.account_password, current_user.get("password") or current_user.get("hashed_password", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid account password")

    await _get_or_create_wallet(db, user_id)
    hashed_pin = get_password_hash(payload.new_pin)
    await db.wallets.update_one(
        {"user_id": user_id},
        {"$set": {"wallet_pin_hash": hashed_pin, "is_wallet_active": True, "updated_at": now_utc()}},
    )
    return {"success": True, "message": "Wallet PIN set successfully"}


async def change_wallet_pin(db: AsyncIOMotorDatabase, user_id: str, current_user: dict, payload: WalletPinChangeRequest) -> dict:
    if payload.new_pin != payload.confirm_pin:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="PIN confirmation does not match")

    wallet = await _get_or_create_wallet(db, user_id)
    if wallet.get("wallet_pin_hash") is None or not verify_password(payload.current_pin, wallet["wallet_pin_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current wallet PIN is invalid")
    if not verify_password(payload.account_password, current_user.get("password") or current_user.get("hashed_password", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid account password")

    hashed_pin = get_password_hash(payload.new_pin)
    await db.wallets.update_one(
        {"user_id": user_id},
        {"$set": {"wallet_pin_hash": hashed_pin, "updated_at": now_utc()}},
    )
    return {"success": True, "message": "Wallet PIN updated successfully"}


async def add_wallet_balance(db: AsyncIOMotorDatabase, user_id: str, payload: WalletTopUpRequest) -> dict:
    await _ensure_user_exists(db, user_id)
    wallet = await _get_or_create_wallet(db, user_id)
    new_balance = float(wallet.get("balance", 0.0)) + payload.amount

    tx_document = {
        "transaction_id": f"WALLET-TX-{user_id[:8]}-{int(now_utc().timestamp())}",
        "user_id": user_id,
        "wallet_id": wallet.get("wallet_id"),
        "type": WalletTransactionType.credit.value,
        "amount": payload.amount,
        "status": "success",
        "description": payload.description or "Wallet top-up",
        "reference_id": payload.payment_method,
        "balance_after_transaction": new_balance,
        "created_at": now_utc(),
    }
    await db.wallet_transactions.insert_one(tx_document)
    await db.wallets.update_one(
        {"user_id": user_id},
        {"$set": {"balance": new_balance, "updated_at": now_utc()}},
    )
    await db.users.update_one(
        {"_id": ensure_object_id(user_id)},
        {"$set": {"wallet_balance": new_balance, "updated_at": now_utc()}},
    )
    return WalletTopUpResponse(balance=new_balance, wallet_id=wallet.get("wallet_id")).model_dump()
