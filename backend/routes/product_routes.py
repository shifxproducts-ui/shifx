"""
routes/product_routes.py — Product CRUD.

Public:   GET /products, GET /products/{id}
Company:  POST /products, PUT /products/{id}, DELETE /products/{id}
Admin:    all of the above
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_verified_user, require_company
from models import Product, Review, User, UserRole
from schemas import (
    MessageResponse,
    ProductCreate,
    ProductList,
    ProductOut,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["Products"])


# ── GET /products ─────────────────────────────────────────────────────────────

@router.get("", response_model=ProductList)
def list_products(
    search: Optional[str]   = Query(None, max_length=100),
    category: Optional[str] = Query(None, max_length=80),
    sort: Optional[str]     = Query("default", pattern="^(default|price_asc|price_desc|rating)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Product).filter(Product.is_active == True)

    if search:
        like = f"%{search.lower()}%"
        q = q.filter(
            Product.name.ilike(like) | Product.description.ilike(like)
        )
    if category and category != "All":
        q = q.filter(Product.category == category)

    if sort == "price_asc":
        q = q.order_by(Product.price.asc())
    elif sort == "price_desc":
        q = q.order_by(Product.price.desc())
    elif sort == "rating":
        q = q.order_by(Product.rating.desc())
    else:
        q = q.order_by(Product.id.desc())

    total = q.count()
    products = q.offset(skip).limit(limit).all()
    return ProductList(total=total, products=products)


# ── GET /products/{id} ────────────────────────────────────────────────────────

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.get(Product, product_id)
    if not p or not p.is_active:
        raise HTTPException(status_code=404, detail="Product not found.")
    return p


# ── POST /products ────────────────────────────────────────────────────────────

@router.post("", response_model=ProductOut, status_code=201)
def create_product(
    body: ProductCreate,
    db: Session = Depends(get_db),
    current: User = Depends(require_company),
):
    product = Product(
        **body.model_dump(),
        company_id=current.id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# ── PUT /products/{id} ────────────────────────────────────────────────────────

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    body: ProductUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(require_company),
):
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found.")

    # Company users can only update their own products; admins can update any
    if current.role != UserRole.admin and p.company_id != current.id:
        raise HTTPException(status_code=403, detail="Not authorised to edit this product.")

    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(p, field, val)

    db.commit()
    db.refresh(p)
    return p


# ── DELETE /products/{id} ─────────────────────────────────────────────────────

@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(require_company),
):
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found.")

    if current.role != UserRole.admin and p.company_id != current.id:
        raise HTTPException(status_code=403, detail="Not authorised to delete this product.")

    # Soft-delete to preserve order history
    p.is_active = False
    db.commit()
    return {"message": "Product removed successfully."}
