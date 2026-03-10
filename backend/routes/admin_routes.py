"""
routes/admin_routes.py — Admin-only routes.

GET  /admin/users              → list all users
GET  /admin/users/{id}         → single user detail
PATCH /admin/users/{id}/status → suspend / activate
DELETE /admin/users/{id}       → hard delete
GET  /admin/analytics          → platform-wide stats
GET  /admin/orders             → all orders across all users
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from database import get_db
from dependencies import require_admin
from models import Order, OrderItem, OrderStatus, Product, Review, User, UserRole
from schemas import (
    AnalyticsOut,
    MessageResponse,
    OrderOut,
    UserAdminOut,
    UserStatusUpdate,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserAdminOut])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/users/{user_id}", response_model=UserAdminOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.patch("/users/{user_id}/status", response_model=UserAdminOut)
def update_user_status(
    user_id: int,
    body: UserStatusUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.id == current.id:
        raise HTTPException(status_code=400, detail="Cannot suspend your own account.")
    user.is_active = body.is_active
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.id == current.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account.")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted."}


# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/analytics", response_model=AnalyticsOut)
def analytics(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    total_users    = db.query(func.count(User.id)).scalar()
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
    total_orders   = db.query(func.count(Order.id)).scalar()
    total_revenue  = db.query(func.coalesce(func.sum(Order.total), 0)).scalar()

    # Orders grouped by status
    status_rows = (
        db.query(Order.status, func.count(Order.id))
        .group_by(Order.status)
        .all()
    )
    orders_by_status = {row[0].value: row[1] for row in status_rows}

    # Top 5 products by number of order items
    top_rows = (
        db.query(
            Product.id,
            Product.name,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.unit_price * OrderItem.quantity).label("revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_products = [
        {"id": r.id, "name": r.name, "units_sold": int(r.units_sold), "revenue": float(r.revenue)}
        for r in top_rows
    ]

    return AnalyticsOut(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        orders_by_status=orders_by_status,
        top_products=top_products,
    )


# ── All Orders (admin view) ───────────────────────────────────────────────────

@router.get("/orders", response_model=list[OrderOut])
def all_orders(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .order_by(Order.created_at.desc())
        .limit(200)
        .all()
    )
