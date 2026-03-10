import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from config import get_settings
from database import get_db
from dependencies import get_current_user
from models import OtpToken, User, UserRole
from schemas import (
    LoginRequest,
    MessageResponse,
    OtpRequestIn,
    OtpVerifyRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserOut,
)
from security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()

OTP_TTL_MINUTES = 10


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def _avatar(name: str) -> str:
    parts = name.strip().split()
    return (parts[0][0] + parts[-1][0]).upper() if len(parts) >= 2 else parts[0][:2].upper()


def send_otp_email(to_email: str, otp_code: str, name: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your SHIFX Verification Code"
        msg["From"]    = f"SHIFX Products <{settings.SMTP_USER}>"
        msg["To"]      = to_email

        html = f"""
        <html>
        <body style="font-family:Arial,sans-serif;background:#f0f4ff;padding:30px">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:36px;box-shadow:0 4px 20px rgba(99,102,241,.12)">
            <div style="text-align:center;margin-bottom:24px">
              <div style="width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#06b6d4);display:inline-flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff">S</div>
              <h1 style="font-size:22px;color:#1e1b4b;margin:12px 0 4px">SHIFX PRODUCTS</h1>
              <p style="color:#a5b4fc;font-size:12px;letter-spacing:.1em;text-transform:uppercase">Email Verification</p>
            </div>
            <p style="color:#4c4f7a;font-size:15px">Hi <strong>{name}</strong>,</p>
            <p style="color:#4c4f7a;font-size:14px;line-height:1.6">Use the code below to verify your email address. This code expires in <strong>10 minutes</strong>.</p>
            <div style="text-align:center;margin:28px 0">
              <div style="display:inline-block;background:#eef2ff;border:2px solid #c7d2fe;border-radius:12px;padding:18px 36px">
                <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;color:#4338ca;letter-spacing:.18em">{otp_code}</span>
              </div>
            </div>
            <p style="color:#9ca3af;font-size:12px;text-align:center">If you didn't request this, please ignore this email.</p>
            <hr style="border:none;border-top:1px solid #e0e7ff;margin:24px 0"/>
            <p style="color:#a5b4fc;font-size:11px;text-align:center">SHIFX Products · Tadepalligudem · Customer Care: 9182772300</p>
          </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())

    except Exception as e:
        print(f"Email sending failed: {e}")


@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email.lower()).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    db.query(OtpToken).filter(OtpToken.email == body.email.lower()).delete()
    code = _generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
    otp = OtpToken(
        email=body.email.lower(),
        code=code,
        full_name=body.full_name.strip(),
        hashed_pw=hash_password(body.password),
        expires_at=expires_at,
    )
    db.add(otp)
    db.commit()

    # Send real email
    send_otp_email(body.email.lower(), code, body.full_name.strip())

    return RegisterResponse(
        message="OTP sent to your email.",
        email=body.email.lower(),
        demo_otp=code if not settings.is_production else None,
    )


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(body: OtpVerifyRequest, db: Session = Depends(get_db)):
    otp = (
        db.query(OtpToken)
        .filter(OtpToken.email == body.email.lower())
        .order_by(OtpToken.created_at.desc())
        .first()
    )
    if not otp:
        raise HTTPException(status_code=400, detail="No pending OTP for this email.")
    if datetime.now(timezone.utc) > otp.expires_at.replace(tzinfo=timezone.utc):
        db.delete(otp)
        db.commit()
        raise HTTPException(status_code=400, detail="OTP has expired.")
    if otp.code != body.code.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP.")
    user = User(
        full_name=otp.full_name,
        email=otp.email,
        hashed_password=otp.hashed_pw,
        role=UserRole.user,
        avatar=_avatar(otp.full_name),
        is_verified=True,
        is_active=True,
    )
    db.add(user)
    db.delete(otp)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, {"role": user.role, "email": user.email})
    return TokenResponse(
        access_token=token,
        role=user.role,
        user=UserOut.model_validate(user)
    )


@router.post("/resend-otp", response_model=RegisterResponse)
def resend_otp(body: OtpRequestIn, db: Session = Depends(get_db)):
    otp = (
        db.query(OtpToken)
        .filter(OtpToken.email == body.email.lower())
        .order_by(OtpToken.created_at.desc())
        .first()
    )
    if not otp:
        raise HTTPException(status_code=400, detail="No pending registration.")
    new_code = _generate_otp()
    otp.code = new_code
    otp.expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
    db.commit()
    send_otp_email(otp.email, new_code, otp.full_name)
    return RegisterResponse(
        message="New OTP sent.",
        email=body.email.lower(),
        demo_otp=new_code if not settings.is_production else None,
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    _invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. Please try again.",
    )
    if not user or not verify_password(body.password, user.hashed_password):
        raise _invalid
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account suspended.")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Account not verified.")
    token = create_access_token(user.id, {"role": user.role, "email": user.email})
    return TokenResponse(
        access_token=token,
        role=user.role,
        user=UserOut.model_validate(user)
    )


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return current