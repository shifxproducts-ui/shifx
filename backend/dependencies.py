"""
dependencies.py — Reusable FastAPI dependencies for authentication & authorization.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserRole
from security import decode_access_token

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the Bearer token and return the matching User row.
    Raises 401 if the token is invalid/expired, 404 if the user no longer exists.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(credentials.credentials)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.get(User, int(user_id))
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended. Contact support.",
        )
    return user


def get_verified_user(current: User = Depends(get_current_user)) -> User:
    """Requires the user's email to be verified."""
    if not current.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Complete OTP verification first.",
        )
    return current


def require_admin(current: User = Depends(get_verified_user)) -> User:
    """Only allows users with role=admin."""
    if current.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current


def require_company(current: User = Depends(get_verified_user)) -> User:
    """Only allows users with role=company or role=admin."""
    if current.role not in (UserRole.company, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company account required.",
        )
    return current
