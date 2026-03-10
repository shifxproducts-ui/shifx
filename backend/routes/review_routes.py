"""
routes/review_routes.py — Product reviews.

POST /reviews                  → submit a review (one per user per product)
GET  /reviews/{product_id}     → list all reviews for a product
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from dependencies import get_verified_user
from models import Product, Review, User
from schemas import ReviewCreate, ReviewOut

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewOut, status_code=201)
def post_review(
    body: ReviewCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_verified_user),
):
    product = db.get(Product, body.product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found.")

    # One review per user per product
    existing = (
        db.query(Review)
        .filter(Review.user_id == current.id, Review.product_id == body.product_id)
        .first()
    )
    if existing:
        # Update existing review
        existing.rating = body.rating
        existing.text   = body.text
        db.commit()
        db.refresh(existing)
        _refresh_product_rating(db, product)
        return db.query(Review).options(joinedload(Review.user)).filter(Review.id == existing.id).one()

    review = Review(
        user_id=current.id,
        product_id=body.product_id,
        rating=body.rating,
        text=body.text,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    _refresh_product_rating(db, product)

    return db.query(Review).options(joinedload(Review.user)).filter(Review.id == review.id).one()


@router.get("/{product_id}", response_model=list[ReviewOut])
def list_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .options(joinedload(Review.user))
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return reviews


def _refresh_product_rating(db: Session, product: Product) -> None:
    """Recalculate and save average rating + review count for a product."""
    reviews = db.query(Review).filter(Review.product_id == product.id).all()
    product.review_count = len(reviews)
    product.rating = round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else 0.0
    db.commit()
