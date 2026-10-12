"""Seed deals, coupons and fix popup in Supabase DB."""
import sys, os, uuid
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app import models as M

db = SessionLocal()

# ── 1. Activate deal 0 + add deals 1 & 2 ─────────────────────────────────────
deal0 = db.query(M.Deal).filter(M.Deal.sort_order == 0).first()
if deal0:
    deal0.active = True
    deal0.title = "THE MEN'S SALE EDIT"
    deal0.subtitle = "Great fits. Up to 30% less."
    deal0.description = "Jackets, tees and trousers. Selected styles, with every saving shown."
    deal0.cta_label = "Shop the deals"
    deal0.cta_href = "/sale"
    print("Deal 0 activated:", deal0.title)
else:
    db.add(M.Deal(
        id=uuid.uuid4(), slug="mens-sale-edit",
        title="THE MEN'S SALE EDIT", subtitle="Great fits. Up to 30% less.",
        description="Jackets, tees and trousers. Selected styles, with every saving shown.",
        cta_label="Shop the deals", cta_href="/sale",
        sort_order=0, active=True
    ))
    print("Deal 0 created")

deal1 = db.query(M.Deal).filter(M.Deal.sort_order == 1).first()
if not deal1:
    db.add(M.Deal(
        id=uuid.uuid4(), slug="jacket-edit",
        title="THE JACKET EDIT", subtitle="Layers made for every season.",
        description="From lightweight overshirts to full outerwear. Build your look from the outside in.",
        cta_label="Shop jackets", cta_href="/shop",
        sort_order=1, active=True
    ))
    print("Deal 1 created: Jacket Edit")
else:
    deal1.active = True
    print("Deal 1 activated:", deal1.title)

deal2 = db.query(M.Deal).filter(M.Deal.sort_order == 2).first()
if not deal2:
    db.add(M.Deal(
        id=uuid.uuid4(), slug="editorial-banner",
        title="ONE WARDROBE. MORE POSSIBILITIES.", subtitle="From workday to weekend.",
        description="Start with the essentials. Build a look that feels like you.",
        cta_label="Find your look", cta_href="/collections",
        sort_order=2, active=True
    ))
    print("Deal 2 created: Editorial Banner")
else:
    deal2.active = True
    print("Deal 2 activated:", deal2.title)

# ── 2. Coupons ────────────────────────────────────────────────────────────────
COUPONS = [
    ("WELCOME10", "Welcome discount — 10% off your first order", "percent", 10, 0),
    ("NEW20",     "20% off for new customers",                   "percent", 20, 0),
    ("VELOURA15", "Veloura exclusive — 15% off",                 "percent", 15, 0),
]
existing = {c.code for c in db.query(M.Coupon).all()}
for code, desc, dtype, dval, minord in COUPONS:
    if code not in existing:
        db.add(M.Coupon(
            id=uuid.uuid4(), code=code, description=desc,
            discount_type=dtype, discount_value=dval,
            min_order=minord, active=True
        ))
        print("Coupon added:", code)
    else:
        c = db.query(M.Coupon).filter_by(code=code).first()
        c.active = True
        print("Coupon activated:", code)

# ── 3. Fix popup ──────────────────────────────────────────────────────────────
popup = db.query(M.Popup).first()
if popup:
    popup.coupon_code = "WELCOME10"
    popup.title = "Your first look, for less"
    popup.message = "Use WELCOME10 on your next order. One code per order."
    popup.active = True
    popup.delay_seconds = 8
    print("Popup fixed:", popup.title)
else:
    db.add(M.Popup(
        id=uuid.uuid4(),
        title="Your first look, for less",
        message="Use WELCOME10 on your next order. One code per order.",
        coupon_code="WELCOME10",
        cta_label="Use my 10% off",
        cta_href="/shop",
        delay_seconds=8,
        trigger_type="delay",
        frequency="session",
        sort_order=0,
        active=True
    ))
    print("Popup created")

db.commit()
db.close()
print("\nDone — all data saved to Supabase.")
