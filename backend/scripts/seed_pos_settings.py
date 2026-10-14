"""Create pos_settings table and seed default row."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import Base, SessionLocal, engine
from app import models as M

# Create table if not exists
Base.metadata.create_all(engine)

db = SessionLocal()
existing = db.query(M.PosSettings).first()
if existing:
    print("PosSettings row already exists — updating defaults only")
    # Update qr_product_url_base if empty
    if not existing.qr_product_url_base:
        existing.qr_product_url_base = "https://veloura.pk/product/"
    db.commit()
else:
    row = M.PosSettings(
        store_name="VELOURA APPAREL",
        store_tagline="Modern Essentials. Everyday Style.",
        store_address="",
        store_phone="+92 317 371 2950",
        store_email="orders@veloura.pk",
        store_website="www.veloura.pk",
        logo_url="",
        show_date=True,
        show_time=True,
        show_receipt_no=True,
        show_salesman=True,
        show_customer=True,
        show_payment_method=True,
        show_discount=True,
        show_cash_recv=True,
        show_change=True,
        show_footer_qr=True,
        show_barcode_on_receipt=False,
        receipt_note="Thank you for shopping with us!",
        footer_line1="Software by AM Enterprises",
        footer_line2="+92 317 371 2950",
        footer_line3="",
        salesman_list=["Admin", "Salesman 1", "Salesman 2"],
        label_show_logo=True,
        label_show_price=True,
        label_show_barcode=True,
        label_show_qr=True,
        label_paper_width_mm=50,
        qr_product_url_base="https://veloura.pk/product/",
    )
    db.add(row)
    db.commit()
    print("PosSettings created with defaults.")

db.close()
print("Done.")
