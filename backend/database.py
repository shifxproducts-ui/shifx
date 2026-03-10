"""
database.py — SQLAlchemy async-compatible engine + session factory.
"""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # drops stale connections automatically
    pool_size=10,
    max_overflow=20,
    echo=not settings.is_production,  # SQL logs only in dev
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


def get_db():
    """FastAPI dependency — yields a DB session and guarantees close."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
