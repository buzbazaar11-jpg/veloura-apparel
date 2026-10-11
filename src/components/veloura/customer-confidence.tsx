import { useEffect, useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { ArrowRight, Check, Copy, MessageCircle, PackageCheck, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useVelouraStore } from '@/lib/veloura-store';
import { formatPrice, storeConfig } from '@/lib/veloura-data';
import { useSettings, usePopups } from '@/lib/api';
import { Logo } from './logo';

const offers = [['WELCOME10', '10%'], ['NEW20', '20%'], ['VEL0URA15', '15%']] as const;

export function ShoppingConfidence() {
  const { applyCoupon } = useVelouraStore();
  const [selected, setSelected] = useState('');
  const { data } = useSettings();
  const stdShipping = data?.payment?.delivery_charge ?? storeConfig.standardShipping;
  const freeAbove = data?.payment?.free_delivery_above ?? storeConfig.freeShippingThreshold;
  const questions = [
    ['What will delivery cost?', `Standard delivery is ${formatPrice(stdShipping)} and is free from ${formatPrice(freeAbove)}. Express delivery is ${formatPrice(storeConfig.expressShipping)}. Your total is shown before you place an order.`],
    ['How do I choose my size?', 'Each product includes a size guide with chest, waist and length measurements. You can also check the fit, material and care details before choosing.'],
    ['Can I pay on delivery?', 'Cash on Delivery, Card and Online are available as demo payment choices. This storefront creates local demo orders only; no payment is collected.'],
    ['How do coupons work?', 'Choose one code below. Your discount appears in the cart and checkout before you place an order. One coupon applies per order.'],
    ['Where can I find my order?', 'Your confirmation includes an order number. Use Order Tracking to view demo orders placed on this device.'],
    ['What about returns?', 'This storefront is a demo. Live return eligibility and delivery timelines need to be confirmed with VEL0URA APPAREL before a real purchase.'],
  ];
  return <>
    <section className="border-y border-border bg-secondary px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-[1400px]">
        <p className="editorial-label">THE DETAILS THAT MATTER</p>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl">A little more confidence. Every step.</h2>
        <div className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[[Truck, 'Delivery, made clear', `Free standard delivery from ${formatPrice(freeAbove)}.`], [Ruler, 'Find your fit', 'Measurements, material and care on every product.'], [ShieldCheck, 'Know your total', 'Prices, delivery and discounts before ordering.'], [PackageCheck, 'Keep track', 'Your order confirmation, all in one place.']].map(([Icon, title, text]) => { const Symbol = Icon as typeof Truck; return <div key={String(title)}><Symbol className="size-6 text-sage" /><h3 className="mt-4 font-sans text-sm font-semibold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{String(text)}</p></div>; })}
        </div>
      </div>
    </section>
    <section id="shopping-help" className="store-section scroll-mt-28">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div><p className="editorial-label">GOOD TO KNOW</p><h2 className="mt-3 font-display text-4xl sm:text-5xl">Before you fall<br />for your next favorite.</h2><Button asChild variant="outline" className="mt-6"><Link to="/track">Track your order <ArrowRight /></Link></Button></div>
        <div>{questions.map(([title, body]) => <details key={title} className="group border-b border-border py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">{title}<span className="text-lg font-normal group-open:hidden">+</span><span className="hidden text-lg font-normal group-open:inline">−</span></summary><p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p></details>)}</div>
      </div>
      <div className="mt-14 border-t border-border pt-9"><p className="editorial-label">A LITTLE EXTRA, ON US</p><div className="mt-5 grid gap-5 sm:grid-cols-3">{offers.map(([code, amount]) => <div key={code} className="flex items-center justify-between gap-3 border-l-2 border-sage pl-4"><div><p className="text-sm font-semibold">{amount} off · {code}</p><p className="mt-1 text-xs text-muted-foreground">One code per order</p></div><Button size="icon" variant="ghost" title={`Use ${code}`} aria-label={`Use ${code}`} onClick={() => { void applyCoupon(code).then(ok => { if (ok) setSelected(code); }); }}>{selected === code ? <Check /> : <Copy />}</Button></div>)}</div><p role="status" className="mt-4 min-h-5 text-xs text-sage">{selected ? `${selected} selected. Your discount will appear in the cart.` : ''}</p></div>
    </section>
  </>;
}

export function CustomerExtras() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const { applyCoupon, isCartOpen, isSearchOpen } = useVelouraStore();
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const { data: popupData } = usePopups();
  const { data: settingsData } = useSettings();
  const activePopup = popupData?.popups?.[0] ?? null;
  const waNumber = settingsData?.settings?.whatsapp_number ?? '1234567890';
  const delayMs = (activePopup?.delay_seconds ?? 18) * 1000;
  useEffect(() => {
    if (pathname !== '/') { setOpen(false); return; }
    let dismissed = false;
    try { dismissed = Date.now() - Number(localStorage.getItem('veloura-offer-dismissed') ?? 0) < 7 * 86400000; } catch { /* Storage may be unavailable. */ }
    if (dismissed) return;
    const timer = window.setTimeout(() => setOpen(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [pathname, delayMs]);
  const close = () => { setOpen(false); try { localStorage.setItem('veloura-offer-dismissed', String(Date.now())); } catch { /* Still dismiss in memory. */ } };
  const couponCode = activePopup?.coupon_code ?? 'WELCOME10';
  return <>
    <Button asChild size="icon" className="whatsapp-float" title="Chat on WhatsApp"><a href={`https://wa.me/${waNumber}?text=Hello%20VEL0URA%20APPAREL%2C%20I%20have%20a%20question%20about%20a%20product.`} target="_blank" rel="noopener noreferrer" aria-label="Chat with VEL0URA APPAREL on WhatsApp"><MessageCircle className="size-7" /></a></Button>
    <Dialog open={open && !isCartOpen && !isSearchOpen} onOpenChange={value => { if (!value) close(); }}><DialogContent className="offer-popup max-w-md text-center"><Logo className="mx-auto" /><p className="editorial-label">YOUR FIRST LOOK, FOR LESS</p><DialogTitle className="font-display text-4xl">{activePopup?.title ?? 'Good style.'}<br />{activePopup?.title ? '' : 'A better welcome.'}</DialogTitle><DialogDescription>{activePopup?.message ?? `Take 10% off with ${couponCode}. One code per order.`}</DialogDescription><div className="border-y border-dashed border-border py-4 font-sans text-lg font-semibold">{couponCode}</div><Button onClick={() => { void applyCoupon(couponCode).then(ok => { if (ok) setApplied(true); }); }}>{applied ? <><Check /> Offer selected</> : <>Use my 10% off <ArrowRight /></>}</Button><Button asChild variant="outline" onClick={close}><Link to="/new-arrivals">Explore new arrivals</Link></Button><p className="text-xs text-muted-foreground">Demo offer · no email or payment required</p></DialogContent></Dialog>
  </>;
}