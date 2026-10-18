"""Order emails over SMTP. Every attempt is logged in order_emails (visible in admin)."""
import smtplib
import ssl
from email.message import EmailMessage

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import OrderEmail, SiteSettings

TEMPLATES = {
    "placed": ("Your order {n} has been placed", "Thank you! We received your order and will confirm it shortly."),
    "confirmed": ("Your order {n} is confirmed", "Good news — your order is confirmed and is being prepared."),
    "processing": ("Your order {n} is being prepared", "Your order is being packed."),
    "shipped": ("Your order {n} has shipped", "Your order is on the way."),
    "delivered": ("Your order {n} was delivered", "Your order has been delivered. Enjoy!"),
    "cancelled": ("Your order {n} was cancelled", "Your order has been cancelled. Contact us if this is a mistake."),
}


def _html(order, brand: str, intro: str) -> str:
    rows = "".join(
        f"<tr><td style='padding:6px 0'>{i.get('name','Item')} × {i.get('quantity',1)}</td>"
        f"<td style='text-align:right'>Rs {float(i.get('price',0))*int(i.get('quantity',1)):,.0f}</td></tr>"
        for i in (order.items or [])
    )
    track = ""
    if order.tracking_number:
        track = f"<p><b>Courier:</b> {order.courier or '-'}<br><b>Tracking #:</b> {order.tracking_number}</p>"
    return f"""<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111">
<h2>{brand}</h2><p>Hi {order.customer_name},</p><p>{intro}</p>
<p><b>Order #:</b> {order.order_number}<br><b>Status:</b> {order.status.title()}</p>
<table style="width:100%;border-collapse:collapse">{rows}
<tr><td>Subtotal</td><td style='text-align:right'>Rs {float(order.subtotal):,.0f}</td></tr>
<tr><td>Discount</td><td style='text-align:right'>- Rs {float(order.discount):,.0f}</td></tr>
<tr><td>Shipping</td><td style='text-align:right'>Rs {float(order.shipping):,.0f}</td></tr>
<tr><td><b>Total</b></td><td style='text-align:right'><b>Rs {float(order.total):,.0f}</b></td></tr></table>
{track}<p><b>Ship to:</b> {order.shipping_address or ''} {order.city or ''}</p>
<p style="color:#666;font-size:12px">Payment: {order.payment_method.upper()}</p></div>"""


def send_order_email(db: Session, order, template: str) -> OrderEmail:
    if template not in TEMPLATES:
        template = "placed"
    s = db.query(SiteSettings).first()
    brand = s.brand_name if s else "Veloura Apparel"
    subject_t, intro = TEMPLATES[template]
    subject = subject_t.format(n=order.order_number)
    log = OrderEmail(order_id=order.id, order_number=order.order_number, recipient=order.customer_email,
                     customer_name=order.customer_name, template=template, subject=subject, status="queued")
    db.add(log)
    if not settings.SMTP_HOST:
        log.status, log.error = "skipped", "SMTP not configured"
        db.commit()
        return log
    try:
        msg = EmailMessage()
        msg["Subject"], msg["From"], msg["To"] = subject, settings.SMTP_FROM, order.customer_email
        if settings.ADMIN_NOTIFY_EMAIL and template == "placed":
            msg["Bcc"] = settings.ADMIN_NOTIFY_EMAIL
        msg.set_content(f"{intro}\nOrder {order.order_number} — total Rs {float(order.total):,.0f}")
        msg.add_alternative(_html(order, brand, intro), subtype="html")
        if settings.SMTP_SSL:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=ssl.create_default_context(), timeout=20) as srv:
                srv.login(settings.SMTP_USER, settings.SMTP_PASSWORD); srv.send_message(msg)
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as srv:
                srv.starttls(context=ssl.create_default_context())
                if settings.SMTP_USER:
                    srv.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                srv.send_message(msg)
        log.status = "sent"
    except Exception as e:  # never break order flow because of email
        log.status, log.error = "failed", str(e)[:500]
    db.commit()
    return log


def send_otp_email(recipient_email: str, recipient_name: str, otp_code: str) -> bool:
    """Send a 6-digit verification code to the customer's email."""
    subject = f"{otp_code} is your VELOURA APPAREL verification code"
    body_html = f"""<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#fcfcfc;border:1px solid #eee;border-radius:12px;color:#111">
    <div style="text-align:center;margin-bottom:28px">
        <h2 style="margin:0;letter-spacing:4px;font-size:22px;font-weight:700;color:#111;text-transform:uppercase">VEL0URA APPAREL</h2>
        <p style="margin:6px 0 0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#777">Account Verification</p>
    </div>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Hi {recipient_name or 'there'},</p>
    <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 24px">Thank you for joining VELOURA APPAREL. Please enter the 6-digit verification code below to activate your account and start shopping:</p>
    <div style="margin:28px 0;padding:20px;background:#18181b;color:#ffffff;text-align:center;font-size:36px;letter-spacing:10px;font-weight:700;border-radius:8px;font-family:monospace">
        {otp_code}
    </div>
    <p style="font-size:13px;line-height:1.5;color:#666;margin:24px 0 0">This security code expires in <b>15 minutes</b>. Never share this code with anyone.</p>
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0" />
    <p style="color:#a1a1aa;font-size:11px;text-align:center;margin:0">VELOURA APPAREL — Contemporary Menswear Essentials</p>
    </div>"""

    print(f"[OTP-DISPATCH] Code {otp_code} generated for {recipient_email}")
    if not settings.SMTP_HOST:
        print("[OTP-DISPATCH] SMTP not configured; code logged above.")
        return True

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM or "Veloura Apparel <orders@velouraapparel.pk>"
        msg["To"] = recipient_email
        msg.set_content(f"Your VELOURA APPAREL verification code is: {otp_code}. Valid for 15 minutes.")
        msg.add_alternative(body_html, subtype="html")

        if settings.SMTP_SSL:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=ssl.create_default_context(), timeout=12) as srv:
                if settings.SMTP_USER: srv.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                srv.send_message(msg)
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12) as srv:
                srv.starttls(context=ssl.create_default_context())
                if settings.SMTP_USER: srv.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                srv.send_message(msg)
        print(f"[OTP-DISPATCH] Email delivered to {recipient_email} via SMTP")
        return True
    except Exception as e:
        print(f"[OTP-DISPATCH WARNING] SMTP delivery failed ({e}), code {otp_code} is still valid in DB.")
        return False
