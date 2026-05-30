from fastapi import APIRouter, Depends, Query

from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.wallet import (
    WalletDetailsResponse,
    WalletPinChangeRequest,
    WalletPinRequest,
    WalletTopUpRequest,
)
from app.services import wallet_service


router = APIRouter()


@router.get("", response_model=WalletDetailsResponse)
async def get_wallet_details(current_user: dict = Depends(get_current_user)) -> dict:
    return await wallet_service.get_wallet_details(get_database(), current_user["id"])


@router.get("/history", response_model=dict)
async def get_wallet_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await wallet_service.get_wallet_history(get_database(), current_user["id"], page, limit)


@router.post("/set-pin", response_model=dict)
async def set_wallet_pin(
    payload: WalletPinRequest,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await wallet_service.set_wallet_pin(get_database(), current_user["id"], current_user, payload)


@router.put("/change-pin", response_model=dict)
async def change_wallet_pin(
    payload: WalletPinChangeRequest,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await wallet_service.change_wallet_pin(get_database(), current_user["id"], current_user, payload)


@router.post("/add", response_model=dict)
async def add_wallet_balance(
    payload: WalletTopUpRequest,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await wallet_service.add_wallet_balance(get_database(), current_user["id"], payload)