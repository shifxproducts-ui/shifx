"""
security.py — Password hashing (bcrypt) and JWT token utilities.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from config import get_settings

settings = get_settings()

# ── bcrypt context ──
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Return bcrypt hash of a plain-text password."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Constant-time comparison of plain password against bcrypt hash."""
    return pwd_context.verify(plain, hashed)


# ── JWT ──
def create_access_token(subject: Any, extra: dict | None = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        subject : user id (stored as 'sub')
        extra   : additional claims e.g. {'role': 'admin', 'email': '...'}
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(subject), "exp": expire, **(extra or {})}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT token.
    Raises JWTError on invalid / expired tokens.
    """
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )
