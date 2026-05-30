from fastapi import APIRouter, Depends

# TODO: Restore admin RBAC after demo
from app.core.dependencies import get_current_admin, get_current_user
from app.database.mongodb import get_database
from app.schemas.order import QRCodeResponse, QRVerifyRequest, QRVerifyResponse
from app.services.qr_service import generate_order_qr_code, verify_order_qr_and_complete


router = APIRouter()


@router.get("/orders/{order_id}", response_model=QRCodeResponse)
async def generate_order_qr(
    order_id: str,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await generate_order_qr_code(get_database(), order_id, current_user)


@router.post("/verify", response_model=QRVerifyResponse)
async def verify_order_qr(
    payload: QRVerifyRequest,
    _: dict = Depends(get_current_user),
) -> dict:
    order = await verify_order_qr_and_complete(get_database(), payload.data)
    return {"order": order}
