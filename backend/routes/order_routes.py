"""
routes/order_routes.py — Order placement and history.

POST /orders        → place a new order (verified user)
GET  /orders        → list current user's orders
GET  /orders/{id}   → single order detail
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from dependencies import get_verified_user
from models import Order, OrderItem, Product, User
from schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])


# ── POST /orders ──────────────────────────────────────────────────────────────

@router.post("", response_model=OrderOut, status_code=201)
def place_order(
    body: OrderCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_verified_user),
):
    order_items = []
    total = 0.0

    for item_in in body.items:
        product = db.get(Product, item_in.product_id)
        if not product or not product.is_active:
            raise HTTPException(
                status_code=404,
                detail=f"Product id={item_in.product_id} not found.",
            )
        if product.stock < item_in.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. "
                       f"Available: {product.stock}, requested: {item_in.quantity}.",
            )
        line_total = product.price * item_in.quantity
        total += line_total

        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item_in.quantity,
                unit_price=product.price,
            )
        )
        # Deduct stock
        product.stock -= item_in.quantity

    order = Order(user_id=current.id, total=round(total, 2), items=order_items)
    db.add(order)
    db.commit()
    db.refresh(order)

    # Reload with relationships for response
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order.id)
        .one()
    )
    return order


# ── GET /orders ───────────────────────────────────────────────────────────────

@router.get("", response_model=list[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    current: User = Depends(get_verified_user),
):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.user_id == current.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders


# ── GET /orders/{id} ──────────────────────────────────────────────────────────

@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_verified_user),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    if order.user_id != current.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return order
