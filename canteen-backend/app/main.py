from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.mongodb import close_mongo_connection, connect_to_mongo
from app.routes import auth, checkout, combo, menu, order, payment, profile, qr, users, wallet


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI backend with JWT authentication and MongoDB.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_mongo_connection()


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(menu.router, prefix="/api/menu", tags=["menu"])
app.include_router(combo.router, prefix="/api/combos", tags=["combos"])
app.include_router(order.router, prefix="/api/orders", tags=["orders"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["wallet"])
app.include_router(payment.router, prefix="/api/payments", tags=["payments"])
app.include_router(checkout.router, prefix="/api/checkout", tags=["checkout"])
app.include_router(qr.router, prefix="/api/qr", tags=["qr"])
