"""
seed.py — Populate the database with initial data.
Run once after creating tables:  python seed.py

Creates:
  • 2 admin users
  • 5 company users
  • 8 seed products (mapped from the frontend PRODUCTS_INIT)
"""
import sys
from database import SessionLocal, engine, Base
import models  # noqa: F401 — register models with Base

from models import Product, User, UserRole
from security import hash_password

# ── Seed data ─────────────────────────────────────────────────────────────────

ADMINS = [
    {"full_name": "Admin One",   "email": "admin1@shifx.com",   "password": "Admin1@123456"},
    {"full_name": "Admin Two",   "email": "admin2@shifx.com",   "password": "Admin2@123456"},
]

COMPANIES = [
    {"full_name": "Employee One",   "email": "employee1@shifx.com",   "password": "Employee1@123456"},
    {"full_name": "Employee Two",   "email": "employee2@shifx.com",   "password": "Employee2@123456"},
    {"full_name": "Employee Three", "email": "employee3@shifx.com",   "password": "Employee3@123456"},
    {"full_name": "Employee Four",  "email": "employee4@shifx.com",   "password": "Employee4@123456"},
    {"full_name": "Employee Five",  "email": "employee5@shifx.com",   "password": "Employee5@123456"},
]

PRODUCTS = [
    {
        "name": "Wireless Headphones",
        "price": 7469,
        "category": "Audio",
        "description": "Premium ANC with 30 hr battery life. Foldable, lightweight design.",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
        "stock": 45,
        "rating": 4.5,
        "review_count": 128,
    },
    {
        "name": "Smart Watch",
        "price": 16599,
        "category": "Wearables",
        "description": "Fitness tracking, notifications & AMOLED display. Water-resistant.",
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
        "stock": 30,
        "rating": 4.7,
        "review_count": 94,
    },
    {
        "name": "Laptop Stand",
        "price": 4149,
        "category": "Accessories",
        "description": "Adjustable aluminum stand for 10–16 inch laptops. Better posture.",
        "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80",
        "stock": 80,
        "rating": 4.3,
        "review_count": 67,
    },
    {
        "name": "Mechanical Keyboard",
        "price": 10789,
        "category": "Peripherals",
        "description": "RGB TKL with Cherry MX switches. N-key rollover, solid build.",
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
        "stock": 25,
        "rating": 4.8,
        "review_count": 203,
    },
    {
        "name": "Gaming Mouse",
        "price": 4979,
        "category": "Peripherals",
        "description": "16000 DPI optical, 6 programmable buttons. Ergonomic grip.",
        "image_url": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80",
        "stock": 60,
        "rating": 4.6,
        "review_count": 156,
    },
    {
        "name": "Smartphone",
        "price": 58099,
        "category": "Phones",
        "description": "6.7 inch OLED, triple camera, 5G. All-day battery life.",
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
        "stock": 15,
        "rating": 4.9,
        "review_count": 312,
    },
    {
        "name": "Bluetooth Speaker",
        "price": 6639,
        "category": "Audio",
        "description": "360 surround, IPX7 waterproof, 24 hr playback. Ultra-portable.",
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
        "stock": 50,
        "rating": 4.4,
        "review_count": 89,
    },
    {
        "name": "Tablet",
        "price": 29049,
        "category": "Computers",
        "description": "10.9 inch Retina display, A14 chip, USB-C for work and play.",
        "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",
        "stock": 20,
        "rating": 4.6,
        "review_count": 177,
    },
]


def avatar(name: str) -> str:
    parts = name.strip().split()
    return (parts[0][0] + parts[-1][0]).upper()


def seed():
    print("Creating tables …")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding admins …")
        for a in ADMINS:
            db.add(User(
                full_name=a["full_name"], email=a["email"],
                hashed_password=hash_password(a["password"]),
                role=UserRole.admin, avatar=avatar(a["full_name"]),
                is_verified=True, is_active=True,
            ))

        print("Seeding company users …")
        for c in COMPANIES:
            db.add(User(
                full_name=c["full_name"], email=c["email"],
                hashed_password=hash_password(c["password"]),
                role=UserRole.company, avatar=avatar(c["full_name"]),
                is_verified=True, is_active=True,
            ))

        db.flush()  # get IDs before adding products

        company = db.query(User).filter(User.role == UserRole.company).first()
        print(f"Seeding {len(PRODUCTS)} products (owner: {company.email}) …")
        for p in PRODUCTS:
            db.add(Product(**p, company_id=company.id, is_active=True))

        db.commit()
        print("✅  Seed complete.")
        print()
        print("Admin logins:")
        for a in ADMINS:
            print(f"  email: {a['email']}   password: {a['password']}")
        print()
        print("Company logins:")
        for c in COMPANIES[:2]:
            print(f"  email: {c['email']}   password: {c['password']}")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
