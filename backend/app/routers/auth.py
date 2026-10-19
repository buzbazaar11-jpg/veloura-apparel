import io
import os
import random
import uuid
from datetime import datetime, timedelta, timezone

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, EmailStr
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_token, hash_password, require_user, user_roles, verify_password
from app.core.utils import coerce, to_dict
from app.models import Order, Profile, User, UserRole
from app.services.email import send_otp_email

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

if settings.cloudinary_configured:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    phone: str | None = None


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class ResendOtpRequest(BaseModel):
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def _generate_otp() -> str:
    return str(random.randint(100000, 999999))


def _now():
    return datetime.now(timezone.utc)


def _session(db, user):
    p = db.get(Profile, user.id)
    return {
        "ok": True,
        "token": create_token(user.id),
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone or (p.phone if p else None),
            "full_name": p.full_name if p else None,
            "is_verified": bool(user.is_verified)
        },
        "roles": user_roles(db, user.id)
    }


@router.post("/signup")
def signup(c: SignupRequest, db: Session = Depends(get_db)):
    if len(c.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")

    email = c.email.lower().strip()
    u = db.query(User).filter(User.email == email).first()

    # If user already exists and is verified
    if u and u.is_verified:
        raise HTTPException(409, "An account with this email already exists. Please sign in.")

    otp = _generate_otp()
    expires = _now() + timedelta(minutes=15)

    if u:
        # Existing unverified user — update credentials and issue fresh OTP
        u.password_hash = hash_password(c.password)
        u.phone = c.phone
        u.otp_code = otp
        u.otp_expires_at = expires
        p = db.get(Profile, u.id)
        if p:
            if c.full_name: p.full_name = c.full_name
            if c.phone: p.phone = c.phone
        else:
            db.add(Profile(id=u.id, email=email, full_name=c.full_name, phone=c.phone))
    else:
        # Brand new user
        u = User(
            email=email,
            password_hash=hash_password(c.password),
            phone=c.phone,
            is_verified=False,
            otp_code=otp,
            otp_expires_at=expires
        )
        db.add(u)
        db.flush()
        db.add(UserRole(user_id=u.id, role="user"))
        db.add(Profile(id=u.id, email=email, full_name=c.full_name, phone=c.phone))

    db.commit()

    # Dispatch email
    send_otp_email(email, c.full_name or email.split("@")[0], otp)

    return {
        "ok": True,
        "requires_otp": True,
        "email": email,
        "message": f"Verification code sent to {email}. Please enter the 6-digit code to complete registration."
    }


@router.post("/verify-otp")
def verify_otp(body: VerifyOtpRequest, db: Session = Depends(get_db)):
    email = body.email.lower().strip()
    u = db.query(User).filter(User.email == email).first()
    if not u:
        raise HTTPException(404, "Account not found")

    if u.is_verified:
        return _session(db, u)

    if not u.otp_code or u.otp_code.strip() != body.otp.strip():
        raise HTTPException(400, "Invalid verification code")

    if u.otp_expires_at and u.otp_expires_at < _now():
        raise HTTPException(400, "Verification code has expired. Please request a new code.")

    # Mark user as verified
    u.is_verified = True
    u.otp_code = None
    u.otp_expires_at = None
    db.commit()

    return _session(db, u)


@router.post("/resend-otp")
def resend_otp(body: ResendOtpRequest, db: Session = Depends(get_db)):
    email = body.email.lower().strip()
    u = db.query(User).filter(User.email == email).first()
    if not u:
        raise HTTPException(404, "Account not found")

    otp = _generate_otp()
    u.otp_code = otp
    u.otp_expires_at = _now() + timedelta(minutes=15)
    db.commit()

    p = db.get(Profile, u.id)
    send_otp_email(email, p.full_name if p else email.split("@")[0], otp)

    return {
        "ok": True,
        "message": f"A new verification code was sent to {email}."
    }


@router.post("/login")
def login(c: LoginRequest, db: Session = Depends(get_db)):
    email = c.email.lower().strip()
    u = db.query(User).filter(User.email == email).first()
    if not u or not verify_password(c.password, u.password_hash):
        raise HTTPException(401, "Invalid email or password")

    # Admin and staff accounts should NEVER be locked out by customer email verification OTP
    roles = user_roles(db, u.id)
    if any(r in ("admin", "staff") for r in roles):
        if not u.is_verified:
            u.is_verified = True
            db.commit()
        return _session(db, u)

    # If user hasn't verified their account yet, send fresh OTP and require verification
    if not u.is_verified:
        otp = _generate_otp()
        u.otp_code = otp
        u.otp_expires_at = _now() + timedelta(minutes=15)
        db.commit()
        p = db.get(Profile, u.id)
        send_otp_email(email, p.full_name if p else email.split("@")[0], otp)
        return {
            "ok": False,
            "requires_otp": True,
            "email": email,
            "message": "Your account is not yet verified. A 6-digit verification code has been sent to your email."
        }

    return _session(db, u)


@router.get("/session")
def session(user=Depends(require_user), db: Session = Depends(get_db)):
    return _session(db, user)


@router.get("/profile")
def get_profile(user=Depends(require_user), db: Session = Depends(get_db)):
    p = db.get(Profile, user.id)
    if not p:
        p = Profile(id=user.id, email=user.email, phone=user.phone)
        db.add(p)
        db.commit()

    email_clean = user.email.lower().strip()
    # Auto-link any existing orders placed with this email that have user_id = None
    unlinked = db.query(Order).filter(
        Order.user_id.is_(None),
        func.lower(Order.customer_email) == email_clean
    ).all()
    for o in unlinked:
        o.user_id = user.id
    if unlinked:
        db.commit()

    orders = db.query(Order).filter(
        or_(Order.user_id == user.id, func.lower(Order.customer_email) == email_clean)
    ).order_by(Order.created_at.desc()).all()

    return {
        "ok": True,
        "profile": to_dict(p),
        "orders": [to_dict(o) for o in orders],
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone or p.phone,
            "full_name": p.full_name or user.email.split("@")[0],
            "is_verified": bool(user.is_verified)
        }
    }


@router.put("/profile")
def put_profile(body: dict, user=Depends(require_user), db: Session = Depends(get_db)):
    p = db.get(Profile, user.id)
    if not p:
        p = Profile(id=user.id, email=user.email)
        db.add(p)

    for field in ("full_name", "phone", "address", "city", "postal_code", "avatar_url"):
        if field in body:
            setattr(p, field, body[field])

    if "phone" in body and body["phone"]:
        user.phone = str(body["phone"]).strip()

    db.commit()
    return {"ok": True, "profile": to_dict(p)}


ALLOWED_AVATAR_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), user=Depends(require_user), db: Session = Depends(get_db)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_AVATAR_EXT:
        raise HTTPException(400, "File type not supported. Please upload JPG, PNG, or WebP.")

    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(413, "Image file too large (max 10MB)")

    url = None
    if settings.cloudinary_configured:
        public_id = f"{settings.CLOUDINARY_FOLDER}/avatars/{user.id}_{uuid.uuid4().hex[:6]}"
        try:
            res = cloudinary.uploader.upload(
                io.BytesIO(data),
                public_id=public_id,
                resource_type="image",
                overwrite=True,
                fetch_format="auto",
                quality="auto:good",
            )
            url = res.get("secure_url") or res.get("url")
        except Exception:
            url = None

    if not url:
        avatar_dir = os.path.join(settings.UPLOAD_DIR, "avatars")
        os.makedirs(avatar_dir, exist_ok=True)
        fname = f"{user.id}_{uuid.uuid4().hex[:6]}{ext}"
        with open(os.path.join(avatar_dir, fname), "wb") as f:
            f.write(data)
        url = f"{settings.PUBLIC_BASE_URL.rstrip('/')}/uploads/avatars/{fname}"

    p = db.get(Profile, user.id)
    if not p:
        p = Profile(id=user.id, email=user.email)
        db.add(p)
    p.avatar_url = url
    db.commit()
    return {"ok": True, "avatar_url": url}


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
def change_password(body: ChangePasswordRequest, user=Depends(require_user), db: Session = Depends(get_db)):
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(400, "Current password is incorrect")
    if len(body.new_password) < 6:
        raise HTTPException(400, "New password must be at least 6 characters")
    user.password_hash = hash_password(body.new_password)
    db.commit()
    return {"ok": True, "message": "Password updated successfully"}
