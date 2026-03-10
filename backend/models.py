"""
models.py — SQLAlchemy ORM models for SHIFX PRODUCTS.

Tables:
  users, otp_tokens, products, orders, order_items,
  reviews, wishlist_items
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, UniqueConstraint, func,
)
from sqlalchemy.orm import relationship
import enum

from database import Base


# ─────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────

class UserRole(str, enum.Enum):
    admin   = "admin"
    company = "company"
    user    = "user"


class OrderStatus(str, enum.Enum):
    pending    = "pending"
    confirmed  = "confirmed"
    processing = "processing"
    shipped    = "shipped"
    delivered  = "delivered"
    cancelled  = "cancelled"


# ─────────────────────────────────────────────
# Users
# ─────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    full_name       = Column(String(120), nullable=False)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    avatar          = Column(String(10), nullable=True)
    is_verified     = Column(Boolean, default=False, nullable=False)
    is_active       = Column(Boolean, default=True,  nullable=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    orders         = relationship("Order",        back_populates="user", cascade="all, delete-orphan")
    reviews        = relationship("Review",       back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"


# ─────────────────────────────────────────────
# OTP Tokens  (short-lived, cleared after use)
# ─────────────────────────────────────────────

class OtpToken(Base):
    __tablename__ = "otp_tokens"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String(255), index=True, nullable=False)
    code       = Column(String(6),   nullable=False)
    full_name  = Column(String(120), nullable=False)
    hashed_pw  = Column(String(255), nullable=False)   # store hashed before verification
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────
# Products
# ─────────────────────────────────────────────

class Product(Base):
    __tablename__ = "products"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price       = Column(Float, nullable=False)           # stored in INR
    category    = Column(String(80), nullable=False, index=True)
    image_url   = Column(String(500), nullable=True)
    stock       = Column(Integer, default=0, nullable=False)
    rating      = Column(Float, default=0.0)
    review_count= Column(Integer, default=0)
    is_active   = Column(Boolean, default=True)
    company_id  = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    company       = relationship("User", foreign_keys=[company_id])
    order_items   = relationship("OrderItem",    back_populates="product")
    reviews       = relationship("Review",       back_populates="product", cascade="all, delete-orphan")
    wishlist_items= relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")


# ─────────────────────────────────────────────
# Orders
# ─────────────────────────────────────────────

class Order(Base):
    __tablename__ = "orders"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    total      = Column(Float, nullable=False)
    status     = Column(Enum(OrderStatus), default=OrderStatus.confirmed, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    user  = relationship("User",      back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, ForeignKey("orders.id"),   nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity   = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float,   nullable=False)   # snapshot at time of purchase

    # relationships
    order   = relationship("Order",   back_populates="items")
    product = relationship("Product", back_populates="order_items")


# ─────────────────────────────────────────────
# Reviews
# ─────────────────────────────────────────────

class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_review_user_product"),
    )

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"),    nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    rating     = Column(Integer, nullable=False)   # 1–5
    text       = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    user    = relationship("User",    back_populates="reviews")
    product = relationship("Product", back_populates="reviews")


# ─────────────────────────────────────────────
# Wishlist
# ─────────────────────────────────────────────

class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),
    )

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"),    nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    added_at   = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    user    = relationship("User",    back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")
