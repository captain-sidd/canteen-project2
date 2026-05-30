from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.payment import CheckoutSummaryRequest, CheckoutSummaryResponse
from app.services.checkout_service import calculate_checkout_summary

router = APIRouter()


@router.post('/summary', response_model=CheckoutSummaryResponse, status_code=200)
async def checkout_summary(
    payload: CheckoutSummaryRequest,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await calculate_checkout_summary(
        get_database(),
        [item.model_dump() for item in payload.items],
        payload.offer_code,
    )
