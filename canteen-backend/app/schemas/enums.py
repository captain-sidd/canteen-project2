from enum import Enum
from typing import Any


class UserRole(str, Enum):
    customer = "customer"
    staff = "staff"
    admin = "admin"

    @classmethod
    def _missing_(cls, value: Any) -> "UserRole":
        if value == "student":
            return cls.customer
        return super()._missing_(value)


class OrderType(str, Enum):
    dine_in = "dine_in"
    takeaway = "takeaway"


class PaymentStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"


class PaymentMethod(str, Enum):
    upi = "upi"
    wallet = "wallet"
    cash = "cash"


class OrderStatus(str, Enum):
    pending = "pending"
    preparing = "preparing"
    ready = "ready"
    completed = "completed"
    cancelled = "cancelled"


class OfferTarget(str, Enum):
    menu = "menu"
    combo = "combo"
    all = "all"


class DiscountType(str, Enum):
    percentage = "percentage"
    flat = "flat"


class WalletTransactionType(str, Enum):
    credit = "credit"
    debit = "debit"
