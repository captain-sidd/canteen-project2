import logging

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.core.security import verify_password
from app.models.base import ensure_object_id, object_id_to_str, now_utc
from app.models.payment import create_payment_document
from app.models.wallet import create_wallet_document
from app.schemas.enums import PaymentMethod, PaymentStatus, WalletTransactionType
from app.schemas.payment import UPIPaymentRequest, WalletPaymentRequest, PaymentResponse
from app.services.checkout_service import calculate_checkout_summary

logger = logging.getLogger(__name__)


async def _get_wallet(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    wallet = await db.wallets.find_one({"user_id": user_id})
    if wallet is None:
        wallet = create_wallet_document(user_id)
        await db.wallets.insert_one(wallet)
    return object_id_to_str(wallet)


async def _ensure_wallet_ready(db: AsyncIOMotorDatabase, user: dict) -> dict:
    wallet = await _get_wallet(db, user["id"])
    if not wallet.get("is_wallet_active"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet is not active. Set a wallet PIN before using wallet payments.",
        )
    return wallet


async def _verify_wallet_pin(wallet: dict, pin: str) -> None:
    hashed_pin = wallet.get("wallet_pin_hash")
    if hashed_pin is None or not verify_password(pin, hashed_pin):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid wallet PIN",
        )


async def _create_wallet_transaction(
    db: AsyncIOMotorDatabase,
    user_id: str,
    wallet_id: str,
    tx_type: str,
    amount: float,
    description: str | None,
    reference_id: str | None,
    balance_after_transaction: float,
):
    transaction = {
        "transaction_id": f"WALLET-TX-{user_id[:8]}-{now_utc().timestamp():.0f}",
        "user_id": user_id,
        "wallet_id": wallet_id,
        "type": tx_type,
        "amount": float(amount),
        "status": "success",
        "description": description,
        "reference_id": reference_id,
        "balance_after_transaction": float(balance_after_transaction),
        "created_at": now_utc(),
    }
    await db.wallet_transactions.insert_one(transaction)
    return object_id_to_str(transaction)


async def process_wallet_payment(db: AsyncIOMotorDatabase, current_user: dict, payload: WalletPaymentRequest) -> dict:
    logger.debug("Processing wallet payment for user %s", current_user.get("id"))

    checkout_summary = await calculate_checkout_summary(
        db,
        [item.model_dump() for item in payload.order_items],
        payload.offer_code,
    )
    total_amount = checkout_summary["final_total"]

    wallet = await _ensure_wallet_ready(db, current_user)
    await _verify_wallet_pin(wallet, payload.wallet_pin)

    if float(wallet["balance"]) < total_amount:
        logger.warning(
            "Insufficient wallet balance: balance=%s required=%s",
            wallet["balance"],
            total_amount,
        )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient wallet balance")

    payment_doc = create_payment_document(
        user_id=current_user["id"],
        payment_method=PaymentMethod.wallet.value,
        amount=total_amount,
        status=PaymentStatus.pending.value,
        transaction_reference=f"WALLET-{wallet.get('wallet_id', 'UNKNOWN')}",
        metadata={"notes": payload.notes, "offer_code": payload.offer_code},
    )
    payment_result = await db.payments.insert_one(payment_doc)
    payment = object_id_to_str({**payment_doc, "_id": payment_result.inserted_id})

    update_result = await db.wallets.update_one(
        {"user_id": current_user["id"], "balance": {"$gte": total_amount}},
        {"$inc": {"balance": -total_amount}, "$set": {"updated_at": now_utc()}},
    )

    if update_result.modified_count == 0:
        await db.payments.update_one(
            {"_id": payment_result.inserted_id},
            {"$set": {"status": PaymentStatus.failed.value, "updated_at": now_utc()}},
        )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient wallet balance during deduction")

    updated_wallet = await db.wallets.find_one({"user_id": current_user["id"]})
    new_balance = float(updated_wallet.get("balance", 0.0))

    await db.users.update_one(
        {"_id": ensure_object_id(current_user["id"])},
        {"$set": {"wallet_balance": new_balance, "updated_at": now_utc()}},
    )

    wallet_transaction = await _create_wallet_transaction(
        db,
        current_user["id"],
        wallet["wallet_id"],
        WalletTransactionType.debit.value,
        total_amount,
        payload.notes or "Wallet payment deduction",
        payment["payment_id"],
        new_balance,
    )

    payment = await db.payments.find_one_and_update(
        {"_id": ensure_object_id(payment["id"])},
        {"$set": {"status": PaymentStatus.paid.value, "updated_at": now_utc()}},
        return_document=ReturnDocument.AFTER,
    )
    payment = object_id_to_str(payment)

    return {
        "payment": PaymentResponse(**payment).model_dump(),
        "wallet_balance": new_balance,
        "wallet_transaction": wallet_transaction,
    }


async def process_upi_payment(db: AsyncIOMotorDatabase, current_user: dict, payload: UPIPaymentRequest) -> dict:
    logger.debug("Processing UPI payment for user %s", current_user.get("id"))

    checkout_summary = await calculate_checkout_summary(
        db,
        [item.model_dump() for item in payload.order_items],
        payload.offer_code,
    )
    total_amount = checkout_summary["final_total"]
    subtotal = checkout_summary["subtotal"]

    logger.debug("UPI payment total_amount calculated=%s subtotal=%s", total_amount, subtotal)

    payment_doc = create_payment_document(
        user_id=current_user["id"],
        payment_method=PaymentMethod.upi.value,
        amount=total_amount,
        status=PaymentStatus.pending.value,
        transaction_reference=payload.upi_id,
        metadata={"upi_id": payload.upi_id, "notes": payload.notes, "offer_code": payload.offer_code},
    )
    result = await db.payments.insert_one(payment_doc)
    payment = object_id_to_str({**payment_doc, "_id": result.inserted_id})

    # Simulate UPI payment processing
    if "fail" in payload.upi_id.lower():
        payment = await db.payments.find_one_and_update(
            {"_id": ensure_object_id(payment["id"])},
            {"$set": {"status": PaymentStatus.failed.value, "updated_at": now_utc()}},
            return_document=ReturnDocument.AFTER,
        )
        payment = object_id_to_str(payment)
        return {
            "payment": PaymentResponse(**payment).model_dump(),
            "status": "failed",
        }

    # Mark payment as successful
    payment = await db.payments.find_one_and_update(
        {"_id": ensure_object_id(payment["id"])},
        {"$set": {"status": PaymentStatus.paid.value, "updated_at": now_utc()}},
        return_document=ReturnDocument.AFTER,
    )
    payment = object_id_to_str(payment)

    return {
        "payment": PaymentResponse(**payment).model_dump(),
        "status": "success",
    }


async def get_payment_history(
    db: AsyncIOMotorDatabase,
    user_id: str,
    page: int = 1,
    limit: int = 10,
) -> dict:
    skip = (page - 1) * limit
    cursor = db.payments.find({"user_id": user_id}).skip(skip).limit(limit).sort("created_at", -1)
    items = [object_id_to_str(payment) async for payment in cursor]

    total = await db.payments.count_documents({"user_id": user_id})
    has_more = (page * limit) < total

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "has_more": has_more,
    }
