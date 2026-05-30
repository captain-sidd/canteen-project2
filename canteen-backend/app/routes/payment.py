from fastapi import APIRouter, Depends, Query

from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.payment import (
    UPIPaymentRequest,
    WalletPaymentRequest,
    WalletPaymentResponse,
    UPIPaymentResponse,
    PaymentHistoryResponse,
)
from app.services.payment_service import process_upi_payment, process_wallet_payment, get_payment_history

router = APIRouter()


@router.post('/wallet-pay', response_model=WalletPaymentResponse, status_code=201)
async def wallet_payment(
    payload: WalletPaymentRequest,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await process_wallet_payment(get_database(), current_user, payload)


@router.post('/upi-pay', response_model=UPIPaymentResponse, status_code=201)
async def upi_payment(
    payload: UPIPaymentRequest,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await process_upi_payment(get_database(), current_user, payload)


@router.get('/history', response_model=PaymentHistoryResponse)
async def payment_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await get_payment_history(get_database(), current_user["id"], page, limit)
