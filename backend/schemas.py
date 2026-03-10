"""
schemas.py — Pydantic v2 request/response schemas for SHIFX PRODUCTS.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from models import OrderStatus, UserRole


# ══════════════════════════════════════════════
#  AUTH
# ══════════════════════════════════════════════

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("full_name")
    @classmethod
    def name_has_two_words(cls, v: str) -> str:
        if len(v.strip().split()) < 2:
            raise ValueError("Full name must include first and last name.")
        return v.strip()


class OtpRequestIn(BaseModel):
    email: EmailStr


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)


class LoginRequest(BaseModel):
    email: str           # allow non-standard emails like admin1@123
    password: str = Field(..., min_length=1)


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: UserRole
    avatar: Optional[str]
    is_verified: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user: UserOut


class RegisterResponse(BaseModel):
    message: str
    email: str
    demo_otp: Optional[str] = None   # only in dev mode


# ══════════════════════════════════════════════
#  PRODUCTS
# ══════════════════════════════════════════════

class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: str = Field(..., min_length=2, max_length=80)
    image_url: Optional[str] = None
    stock: int = Field(default=0, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=2, max_length=80)
    image_url: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    rating: float
    review_count: int
    is_active: bool
    company_id: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductList(BaseModel):
    total: int
    products: List[ProductOut]


# ══════════════════════════════════════════════
#  ORDERS
# ══════════════════════════════════════════════

class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)


class OrderCreate(BaseModel):
    items: List[OrderItemIn] = Field(..., min_length=1)


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[ProductOut]

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    user_id: int
    total: float
    status: OrderStatus
    created_at: datetime
    items: List[OrderItemOut]

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════
#  REVIEWS
# ══════════════════════════════════════════════

class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    text: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    text: Optional[str]
    created_at: datetime
    user: Optional[UserOut]

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════
#  WISHLIST
# ══════════════════════════════════════════════

class WishlistItemOut(BaseModel):
    id: int
    product_id: int
    added_at: datetime
    product: Optional[ProductOut]

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════
#  ADMIN
# ══════════════════════════════════════════════

class UserAdminOut(UserOut):
    """Extended user info for admin panel."""
    pass


class UserStatusUpdate(BaseModel):
    is_active: bool


class AnalyticsOut(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    orders_by_status: dict
    top_products: List[dict]


# ══════════════════════════════════════════════
#  COMPANY
# ══════════════════════════════════════════════

class CompanyStatsOut(BaseModel):
    product_count: int
    total_orders: int
    total_revenue: float
    avg_rating: float


# ══════════════════════════════════════════════
#  GENERIC
# ══════════════════════════════════════════════

class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str
