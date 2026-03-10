"""
routes/company_routes.py — Company-only routes.

GET /company/stats      → sales stats for the logged-in company
GET /company/products   → company's own product list
GET /company/orders     → orders containing company's products
"""
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from database import get_db
from dependencies import require_company
from models import Order, OrderItem, Product, User
from schemas import CompanyStatsOut, OrderOut, ProductList

router = APIRouter(prefix="/company", tags=["Company"])


@router.get("/stats", response_model=CompanyStatsOut)
def company_stats(
    db: Session = Depends(get_db),
    current: User = Depends(require_company),
):
    products = db.query(Product).filter(Product.company_id == current.id).all()
    product_ids = [p.id for p in products]

    if not product_ids:
        return CompanyStatsOut(
            product_count=0, total_orders=0,
            total_revenue=0.0, avg_rating=0.0,
        )

    order_items = (
        db.query(OrderItem)
        .filter(OrderItem.product_id.in_(product_ids))
        .all()
    )

    order_ids      = {oi.order_id for oi in order_items}
    total_revenue  = sum(oi.unit_price * oi.quantity for oi in order_items)
    ratings        = [p.rating for p in products if p.rating > 0]
    avg_rating     = round(sum(ratings) / len(ratings), 2) if ratings else 0.0

    return CompanyStatsOut(
        product_count=len(products),
        total_orders=len(order_ids),
        total_revenue=round(total_revenue, 2),
        avg_rating=avg_rating,
    )


@router.get("/products", response_model=ProductList)
def company_products(
    db: Session = Depends(get_db),
    current: User = Depends(require_company),
):
    products = (
        db.query(Product)
        .filter(Product.company_id == current.id)
        .order_by(Product.created_at.desc())
        .all()
    )
    return ProductList(total=len(products), products=products)


@router.get("/orders", response_model=list[OrderOut])
def company_orders(
    db: Session = Depends(get_db),
    current: User = Depends(require_company),
):
    """Return all orders that contain at least one product owned by this company."""
    my_product_ids = (
        db.query(Product.id).filter(Product.company_id == current.id).subquery()
    )
    order_ids = (
        db.query(OrderItem.order_id)
        .filter(OrderItem.product_id.in_(my_product_ids))
        .distinct()
        .subquery()
    )
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id.in_(order_ids))
        .order_by(Order.created_at.desc())
        .limit(100)
        .all()
    )
    return orders
