"""
routes/wishlist_routes.py — User wishlist management.

GET    /wishlist              → list all wishlist items
POST   /wishlist              → add a product
DELETE /wishlist/{product_id} → remove a product
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from dependencies import get_verified_user
from models import Product, User, WishlistItem
from schemas import MessageResponse, WishlistItemOut

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=list[WishlistItemOut])
def get_wishlist(
    db: Session = Depends(get_db),
    current: User = Depends(get_verified_user),
):
    items = (
        db.query(WishlistItem)
        .options(joinedload(WishlistItem.product))
        .filter(WishlistItem.user_id == current.id)
        .order_by(WishlistItem.added_at.desc())
        .all()
    )
    return items


@router.post("", response_model=WishlistItemOut, status_code=201)
def add_to_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_verified_user),
):
    product = db.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found.")

    existing = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current.id, WishlistItem.product_id == product_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Product already in wishlist.")

    item = WishlistItem(user_id=current.id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)

    return db.query(WishlistItem).options(joinedload(WishlistItem.product)).filter(WishlistItem.id == item.id).one()


@router.delete("/{product_id}", response_model=MessageResponse)
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_verified_user),
):
    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current.id, WishlistItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist.")

    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist."}
