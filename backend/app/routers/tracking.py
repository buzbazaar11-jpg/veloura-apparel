"""Analytics events, abandoned-cart leads and browser->server Meta bridge."""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.utils import coerce
from app.models import AnalyticsEvent, CartLead
from app.services import meta

router = APIRouter(prefix="/api/v1/track", tags=["tracking"])
ALLOWED_META = {"ViewContent", "Search", "AddToCart", "InitiateCheckout", "AddPaymentInfo", "Lead", "Contact"}


@router.post("/event")
def event(body: dict, request: Request, db: Session = Depends(get_db)):
    data = coerce(AnalyticsEvent, body)
    data.setdefault("event_name", "unknown")
    data["user_agent"] = request.headers.get("user-agent", "")[:400]
    if isinstance(body.get("metadata"), dict): data["metadata_"] = body["metadata"]
    db.add(AnalyticsEvent(**data)); db.commit()
    return {"ok": True}


@router.post("/lead")
def lead(body: dict, db: Session = Depends(get_db)):
    sid = body.get("session_id")
    phone = (body.get("phone") or "").strip()
    email = (body.get("email") or "").strip().lower()

    row = None
    if sid:
        row = db.query(CartLead).filter(CartLead.session_id == sid).first()
    if not row and phone:
        row = db.query(CartLead).filter(CartLead.phone == phone).order_by(CartLead.created_at.desc()).first()
    if not row and email:
        row = db.query(CartLead).filter(CartLead.email == email).order_by(CartLead.created_at.desc()).first()

    if not row:
        if not sid:
            import uuid
            sid = f"lead_{uuid.uuid4().hex[:12]}"
        row = CartLead(session_id=sid)

    for k, v in coerce(CartLead, body).items():
        if k == "notes" and v:
            row.notes = (row.notes + " | " + str(v)) if row.notes else str(v)
            continue
        if k in ("contacted",): continue
        if v not in (None, "") or k in ("items", "item_count", "cart_value"):
            setattr(row, k, v)

    if row.stage == "ordered" and body.get("stage") != "ordered":
        pass  # keep ordered status
    else:
        if body.get("stage"):
            row.stage = body.get("stage")

    db.add(row)
    db.commit()
    return {"ok": True, "lead_id": str(row.id), "session_id": row.session_id}



@router.post("/meta")
def meta_bridge(body: dict, request: Request, db: Session = Depends(get_db)):
    name, eid = body.get("event_name"), body.get("event_id")
    if name not in ALLOWED_META or not eid: return {"ok": False, "error": "invalid event"}
    status = meta.send_event(db, name, str(eid)[:120], custom=body.get("custom_data") or {},
                             fbp=body.get("fbp"), fbc=body.get("fbc"), url=body.get("url"),
                             ip=request.client.host if request.client else None, ua=request.headers.get("user-agent"))
    return {"ok": True, "status": status}
