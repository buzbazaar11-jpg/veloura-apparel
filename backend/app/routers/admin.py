"""Admin API: generic CRUD for every table + orders, stats, emails, leads, uploads, settings."""
import io
import os
import uuid
from datetime import datetime, timedelta, timezone

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_password, require_admin
from app.core.utils import coerce, col_kind, slugify, to_dict
from app import models as M
from app.routers.orders import _email_bg

router = APIRouter(prefix="/api/v1/admin", tags=["admin"], dependencies=[Depends(require_admin)])

# Configure Cloudinary once at import time (no-op if credentials missing)
if settings.cloudinary_configured:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )

RESOURCES = {
    "products": M.Product, "collections": M.Collection, "categories": M.Category, "deals": M.Deal,
    "coupons": M.Coupon, "hero_slides": M.HeroSlide, "popups": M.Popup, "reviews": M.Review,
    "blog_posts": M.BlogPost, "faqs": M.Faq, "trust_sections": M.TrustSection, "cart_leads": M.CartLead,
}
READONLY = {"order_emails": M.OrderEmail, "analytics_events": M.AnalyticsEvent, "meta_event_log": M.MetaEventLog,
            "profiles": M.Profile}
SINGLETONS = {"site_settings": M.SiteSettings, "payment_settings": M.PaymentSettings, "meta_settings": M.MetaSettings, "pos_settings": M.PosSettings}
STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
EMAIL_ON = {"confirmed", "shipped", "delivered", "cancelled"}


def _model(name):
    m = RESOURCES.get(name) or READONLY.get(name)
    if not m: raise HTTPException(404, "Unknown resource")
    return m


@router.get("/schema")
def schema():
    out = {}
    for n, m in {**RESOURCES, **READONLY, **SINGLETONS, "orders": M.Order}.items():
        out[n] = {"readonly": n in READONLY, "singleton": n in SINGLETONS,
                  "columns": [{"name": c.name, "kind": col_kind(c), "required": not c.nullable and c.default is None}
                              for c in m.__table__.columns]}
    return {"ok": True, "schema": out}


@router.get("/r/{name}")
def list_rows(name: str, limit: int = 500, db: Session = Depends(get_db)):
    m = _model(name)
    order = m.created_at.desc() if hasattr(m, "created_at") else None
    rows = db.query(m).order_by(order).limit(min(limit, 5000)).all()
    return {"ok": True, "rows": [to_dict(r) for r in rows]}


@router.post("/r/{name}")
def create_row(name: str, body: dict, db: Session = Depends(get_db)):
    if name not in RESOURCES: raise HTTPException(400, "Read-only resource")
    m = RESOURCES[name]
    data = coerce(m, body)
    if "slug" in m.__table__.columns and not data.get("slug"):
        data["slug"] = slugify(body.get("name") or body.get("title") or "")
    row = m(**data); db.add(row)
    try: db.commit()
    except Exception as e:
        db.rollback(); raise HTTPException(400, str(e.__cause__ or e)[:300])
    return {"ok": True, "row": to_dict(row)}


@router.put("/r/{name}/{rid}")
def update_row(name: str, rid: uuid.UUID, body: dict, db: Session = Depends(get_db)):
    if name not in RESOURCES: raise HTTPException(400, "Read-only resource")
    row = db.get(RESOURCES[name], rid)
    if not row: raise HTTPException(404, "Not found")
    for k, v in coerce(RESOURCES[name], body).items(): setattr(row, k, v)
    try: db.commit()
    except Exception as e:
        db.rollback(); raise HTTPException(400, str(e.__cause__ or e)[:300])
    return {"ok": True, "row": to_dict(row)}


@router.delete("/r/{name}/{rid}")
def delete_row(name: str, rid: uuid.UUID, db: Session = Depends(get_db)):
    if name not in RESOURCES: raise HTTPException(400, "Read-only resource")
    row = db.get(RESOURCES[name], rid)
    if row: db.delete(row); db.commit()
    return {"ok": True}


@router.get("/settings/{name}")
def get_singleton(name: str, db: Session = Depends(get_db)):
    m = SINGLETONS.get(name) or (_ for _ in ()).throw(HTTPException(404))
    row = db.query(m).first()
    if not row: row = m(); db.add(row); db.commit()
    return {"ok": True, "row": to_dict(row)}


@router.put("/settings/{name}")
def put_singleton(name: str, body: dict, db: Session = Depends(get_db)):
    m = SINGLETONS.get(name)
    if not m: raise HTTPException(404)
    row = db.query(m).first() or m()
    for k, v in coerce(m, body).items(): setattr(row, k, v)
    db.add(row); db.commit()
    return {"ok": True, "row": to_dict(row)}


# ---------- Orders ----------
@router.get("/orders")
def orders(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(M.Order)
    if status: q = q.filter(M.Order.status == status)
    return {"ok": True, "orders": [to_dict(o) for o in q.order_by(M.Order.created_at.desc()).limit(2000)]}


@router.patch("/orders/{oid}")
def update_order(oid: uuid.UUID, body: dict, bg: BackgroundTasks, db: Session = Depends(get_db)):
    o = db.get(M.Order, oid)
    if not o: raise HTTPException(404, "Order not found")
    new = body.get("status")
    if new and new not in STATUSES: raise HTTPException(400, f"status must be one of {STATUSES}")
    for k in ("notes", "tracking_number", "courier"):
        if k in body: setattr(o, k, body[k])
    if body.get("estimated_delivery"): o.estimated_delivery = datetime.fromisoformat(body["estimated_delivery"])
    changed = new and new != o.status
    if changed:
        o.status = new
        o.status_history = [*(o.status_history or []), {"status": new, "at": datetime.now(timezone.utc).isoformat()}]
    db.commit()
    if changed and new in EMAIL_ON and body.get("notify", True):
        bg.add_task(_email_bg, o.id, new)
    return {"ok": True, "order": to_dict(o)}


@router.post("/orders/{oid}/email")
def resend_email(oid: uuid.UUID, body: dict, bg: BackgroundTasks, db: Session = Depends(get_db)):
    if not db.get(M.Order, oid): raise HTTPException(404)
    bg.add_task(_email_bg, oid, body.get("template", "placed"))
    return {"ok": True}


# ---------- Dashboard ----------
@router.get("/stats")
def stats(days: int = 30, db: Session = Depends(get_db)):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    q = db.query(M.Order).filter(M.Order.created_at >= since, M.Order.status != "cancelled")
    revenue = float(q.with_entities(func.coalesce(func.sum(M.Order.total), 0)).scalar())
    count = q.count()
    ev = dict(db.query(M.AnalyticsEvent.event_name, func.count()).filter(M.AnalyticsEvent.created_at >= since)
              .group_by(M.AnalyticsEvent.event_name).all())
    return {"ok": True, "days": days, "revenue": revenue, "orders": count, "aov": revenue / count if count else 0,
            "products": db.query(M.Product).count(), "customers": db.query(M.User).count(),
            "leads": db.query(M.CartLead).filter(M.CartLead.stage != "ordered").count(),
            "by_status": dict(db.query(M.Order.status, func.count()).group_by(M.Order.status).all()),
            "funnel": {k: ev.get(k, 0) for k in ("page_view", "view_item", "add_to_cart", "begin_checkout", "purchase")},
            **_extra(db, since, days)}


def _extra(db, since, days):
    rows = db.query(M.Order).filter(M.Order.created_at >= since).all()
    today = datetime.now(timezone.utc).date()
    trend = {(today - timedelta(days=i)).isoformat(): {"revenue": 0.0, "orders": 0} for i in range(days - 1, -1, -1)}
    cats, prods = {}, {p.slug: (p.category or "Other") for p in db.query(M.Product).all()}
    coupons_used = 0
    for o in rows:
        d = o.created_at.date().isoformat()
        if o.status != "cancelled" and d in trend:
            trend[d]["revenue"] += float(o.total); trend[d]["orders"] += 1
        if o.coupon_code: coupons_used += 1
        if o.status == "cancelled": continue
        for it in o.items or []:
            c = prods.get(it.get("slug"), "Other")
            cats[c] = cats.get(c, 0) + float(it.get("price", 0)) * int(it.get("quantity", 1))
    week = sum(v["revenue"] for k, v in list(trend.items())[-7:])
    prev = sum(v["revenue"] for k, v in list(trend.items())[-14:-7])
    pv = db.query(M.AnalyticsEvent).filter(M.AnalyticsEvent.created_at >= since, M.AnalyticsEvent.event_name == "page_view").count()
    return {"trend": [{"date": k, **v} for k, v in trend.items()], "by_category": cats,
            "week_revenue": week, "prev_week_revenue": prev, "coupons_used": coupons_used,
            "low_stock": db.query(M.Product).filter(M.Product.stock <= 5).count(),
            "active_products": db.query(M.Product).filter(M.Product.active == True).count(),  # noqa: E712
            "active_coupons": db.query(M.Coupon).filter(M.Coupon.active == True).count(),  # noqa: E712
            "conversion": (len(rows) / pv * 100) if pv else 0}


# ---------- Uploads ----------
ALLOWED = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".mp4", ".webm", ".mov"}
ALLOWED_MIME = {
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
    "video/mp4", "video/webm", "video/quicktime",
}


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED:
        raise HTTPException(400, "File type not allowed")

    # Read full file into memory (respects MAX_UPLOAD_MB)
    size, limit = 0, settings.MAX_UPLOAD_MB * 1024 * 1024
    chunks: list[bytes] = []
    while chunk := await file.read(1024 * 1024):
        size += len(chunk)
        if size > limit:
            raise HTTPException(413, "File too large")
        chunks.append(chunk)
    data = b"".join(chunks)

    # ── Cloudinary path ──────────────────────────────────────────────────────
    if settings.cloudinary_configured:
        resource_type = "video" if ext in {".mp4", ".webm", ".mov"} else "image"
        public_id = f"{settings.CLOUDINARY_FOLDER}/{uuid.uuid4().hex}"
        try:
            result = cloudinary.uploader.upload(
                io.BytesIO(data),
                public_id=public_id,
                resource_type=resource_type,
                overwrite=False,
                # Auto-optimize: convert to WebP for images, strip metadata
                fetch_format="auto",
                quality="auto:good",
            )
            return {"ok": True, "url": result["secure_url"]}
        except Exception as exc:
            raise HTTPException(500, f"Cloudinary upload failed: {exc}") from exc

    # ── Local fallback (when Cloudinary not configured) ──────────────────────
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(settings.UPLOAD_DIR, name), "wb") as f:
        f.write(data)
    return {"ok": True, "url": f"{settings.PUBLIC_BASE_URL.rstrip('/')}/uploads/{name}"}


# ---------- Users / roles ----------
@router.get("/users")
def users(db: Session = Depends(get_db)):
    roles = {}
    for r in db.query(M.UserRole).all():
        roles.setdefault(str(r.user_id), []).append(r.role)

    orders = db.query(M.Order).all()
    stats_by_uid = {}
    stats_by_email = {}
    for o in orders:
        tot = float(o.total or 0)
        dt = o.created_at
        if o.user_id:
            uid = str(o.user_id)
            s = stats_by_uid.setdefault(uid, {"count": 0, "total": 0.0, "last_order": None})
            s["count"] += 1
            if o.status != "cancelled": s["total"] += tot
            if not s["last_order"] or (dt and dt > s["last_order"]): s["last_order"] = dt
        if o.customer_email:
            em = o.customer_email.strip().lower()
            s = stats_by_email.setdefault(em, {"count": 0, "total": 0.0, "last_order": None})
            s["count"] += 1
            if o.status != "cancelled": s["total"] += tot
            if not s["last_order"] or (dt and dt > s["last_order"]): s["last_order"] = dt

    profiles = {str(p.id): p for p in db.query(M.Profile).all()}
    all_users = db.query(M.User).order_by(M.User.created_at.desc()).all()

    out = []
    for u in all_users:
        uid = str(u.id)
        prof = profiles.get(uid)
        em = u.email.strip().lower() if u.email else ""
        su = stats_by_uid.get(uid)
        se = stats_by_email.get(em)

        cnt = (su["count"] if su else 0) or (se["count"] if se else 0)
        tot = (su["total"] if su else 0.0) or (se["total"] if se else 0.0)
        last_dt = (su["last_order"] if su else None) or (se["last_order"] if se else None)

        out.append({
            "id": uid,
            "email": u.email,
            "phone": u.phone or (prof.phone if prof else None),
            "full_name": (prof.full_name if prof and prof.full_name else (u.email.split("@")[0] if u.email else "Customer")),
            "city": prof.city if prof else None,
            "address": prof.address if prof else None,
            "is_verified": bool(u.is_verified),
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "roles": roles.get(uid, ["user"]),
            "orders_count": cnt,
            "total_spent": round(tot, 2),
            "last_order_at": last_dt.isoformat() if last_dt else None
        })
    return {"ok": True, "users": out}


@router.post("/users")
def create_user(body: dict, db: Session = Depends(get_db)):
    email = (body.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(400, "Email is required")
    if db.query(M.User).filter(M.User.email == email).first():
        raise HTTPException(409, "User with this email already exists")

    password = body.get("password") or "Veloura@123"
    phone = (body.get("phone") or "").strip() or None
    full_name = (body.get("full_name") or "").strip() or None
    is_verified = bool(body.get("is_verified", True))
    role = body.get("role") or "user"
    if role not in ("admin", "staff", "user"):
        role = "user"

    user = M.User(
        email=email,
        password_hash=hash_password(password),
        phone=phone,
        is_verified=is_verified
    )
    db.add(user)
    db.flush()

    db.add(M.UserRole(user_id=user.id, role=role))
    db.add(M.Profile(id=user.id, email=email, full_name=full_name, phone=phone,
                     city=body.get("city"), address=body.get("address")))
    db.commit()
    return {"ok": True, "id": str(user.id)}


@router.put("/users/{uid}")
def update_user(uid: uuid.UUID, body: dict, db: Session = Depends(get_db)):
    user = db.get(M.User, uid)
    if not user:
        raise HTTPException(404, "User not found")

    if "email" in body and body["email"]:
        new_email = body["email"].strip().lower()
        if new_email != user.email:
            if db.query(M.User).filter(M.User.email == new_email).first():
                raise HTTPException(409, "Email already in use")
            user.email = new_email

    if "phone" in body:
        user.phone = body["phone"].strip() if body["phone"] else None
    if "is_verified" in body:
        user.is_verified = bool(body["is_verified"])
    if body.get("password"):
        user.password_hash = hash_password(body["password"])

    prof = db.get(M.Profile, uid)
    if not prof:
        prof = M.Profile(id=uid, email=user.email)
        db.add(prof)
    if "full_name" in body: prof.full_name = body["full_name"]
    if "phone" in body: prof.phone = body["phone"]
    if "city" in body: prof.city = body["city"]
    if "address" in body: prof.address = body["address"]

    if "role" in body:
        new_role = body["role"]
        if new_role in ("admin", "staff", "user"):
            db.query(M.UserRole).filter_by(user_id=uid).delete()
            db.add(M.UserRole(user_id=uid, role=new_role))

    db.commit()
    return {"ok": True}


@router.delete("/users/{uid}")
def delete_user(uid: uuid.UUID, db: Session = Depends(get_db), me=Depends(require_admin)):
    if uid == me.id:
        raise HTTPException(400, "Cannot delete your own admin account")
    user = db.get(M.User, uid)
    if not user:
        raise HTTPException(404, "User not found")

    db.query(M.UserRole).filter_by(user_id=uid).delete()
    db.query(M.Profile).filter_by(id=uid).delete()
    db.query(M.Order).filter_by(user_id=uid).update({"user_id": None})
    db.delete(user)
    db.commit()
    return {"ok": True}


@router.post("/users/{uid}/role")
def set_role(uid: uuid.UUID, body: dict, db: Session = Depends(get_db), me=Depends(require_admin)):
    role = body.get("role")
    if role not in ("admin", "staff", "user"): raise HTTPException(400, "bad role")
    if uid == me.id and not body.get("grant", True): raise HTTPException(400, "Cannot remove your own role")
    ex = db.query(M.UserRole).filter_by(user_id=uid, role=role).first()
    if body.get("grant", True) and not ex: db.add(M.UserRole(user_id=uid, role=role))
    if not body.get("grant", True) and ex: db.delete(ex)
    db.commit()
    return {"ok": True}
