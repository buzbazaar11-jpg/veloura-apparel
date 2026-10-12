import { useEffect, useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { ArrowRight, Check, Copy, MessageCircle, PackageCheck, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useVelouraStore } from '@/lib/veloura-store';
import { formatPrice, storeConfig } from '@/lib/veloura-data';
import { useSettings, usePopups, useFaqs, useTrust, useCoupons } from '@/lib/api';
import { Logo } from './logo';

export function ShoppingConfidence() {
  const { applyCoupon } = useVelouraStore();
  const [selected, setSelected] = useState('');
  const { data: settingsData } = useSettings();
  const { data: faqsData, isLoading: faqsLoading } = useFaqs();
  const { data: trustData, isLoading: trustLoading } = useTrust();
  const { data: couponsData, isLoading: couponsLoading } = useCoupons();

  const stdShipping = settingsData?.payment?.delivery_charge ?? storeConfig.standardShipping;
  const freeAbove = settingsData?.payment?.free_delivery_above ?? storeConfig.freeShippingThreshold;

  // Trust sections from DB — each section maps to one of the 4 confidence cards
  const trustSections = trustData?.sections ?? [];
  // FAQs from DB
  const faqs = faqsData?.faqs ?? [];
  // Active coupons from DB
  const liveCoupons = couponsData?.coupons ?? [];

  // Default trust cards using settings data (always shown — delivery info is dynamic from settings)
  const defaultTrustCards = [
    { Icon: Truck, title: 'Delivery, made clear', text: `Free standard delivery from ${formatPrice(freeAbove)}.` },
    { Icon: Ruler, title: 'Find your fit', text: 'Measurements, material and care on every product.' },
    { Icon: ShieldCheck, title: 'Know your total', text: 'Prices, delivery and discounts before ordering.' },
    { Icon: PackageCheck, title: 'Keep track', text: 'Your order confirmation, all in one place.' },
  ];

  // Use DB trust sections if available, otherwise fall back to default cards
  const trustCards = trustSections.length > 0
    ? trustSections.slice(0, 4).map((s, i) => ({
        Icon: [Truck, Ruler, ShieldCheck, PackageCheck][i % 4]!,
        title: s.heading,
        text: s.body ?? s.bullets?.[0] ?? '',
      }))
    : defaultTrustCards;

  return <>
    <section className="border-y border-border bg-secondary px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-[1400px]">
        <p className="editorial-label">THE DETAILS THAT MATTER</p>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl">A little more confidence. Every step.</h2>
        {trustLoading ? (
          <div className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[0,1,2,3].map(i => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="h-6 w-6 rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {trustCards.map(({ Icon, title, text }) => (
              <div key={title}>
                <Icon className="size-6 text-sage" />
                <h3 className="mt-4 font-sans text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>

    <section id="shopping-help" className="store-section scroll-mt-28">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="editorial-label">GOOD TO KNOW</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Before you fall<br />for your next favorite.</h2>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/track">Track your order <ArrowRight /></Link>
          </Button>
        </div>
        <div>
          {faqsLoading ? (
            <div className="space-y-4">
              {[0,1,2,3].map(i => (
                <div key={i} className="animate-pulse border-b border-border py-4">
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : faqs.length > 0 ? (
            faqs.map(faq => (
              <details key={faq.id} className="group border-b border-border py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  {faq.question}
                  <span className="text-lg font-normal group-open:hidden">+</span>
                  <span className="hidden text-lg font-normal group-open:inline">−</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
              </details>
            ))
          ) : null}
        </div>
      </div>

      {/* Coupons section — only shown when there are live coupons from DB */}
      {!couponsLoading && liveCoupons.length > 0 && (
        <div className="mt-14 border-t border-border pt-9">
          <p className="editorial-label">A LITTLE EXTRA, ON US</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {liveCoupons.map(coupon => {
              const amount = coupon.discount_type === 'percent'
                ? `${coupon.discount_value}%`
                : formatPrice(coupon.discount_value);
              return (
                <div key={coupon.id} className="flex items-center justify-between gap-3 border-l-2 border-sage pl-4">
                  <div>
                    <p className="text-sm font-semibold">{amount} off · {coupon.code}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {coupon.description ?? 'One code per order'}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    title={`Use ${coupon.code}`}
                    aria-label={`Use ${coupon.code}`}
                    onClick={() => { void applyCoupon(coupon.code).then(ok => { if (ok) setSelected(coupon.code); }); }}
                  >
                    {selected === coupon.code ? <Check /> : <Copy />}
                  </Button>
                </div>
              );
            })}
          </div>
          <p role="status" className="mt-4 min-h-5 text-xs text-sage">
            {selected ? `${selected} selected. Your discount will appear in the cart.` : ''}
          </p>
        </div>
      )}
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
  const { data: couponsData } = useCoupons();
  const activePopup = popupData?.popups?.[0] ?? null;
  const waNumber = settingsData?.settings?.whatsapp_number ?? '';
  const delayMs = (activePopup?.delay_seconds ?? 18) * 1000;

  // Popup coupon: prefer the popup's own coupon_code, then first live coupon, else no popup
  const liveCoupons = couponsData?.coupons ?? [];
  const popupCouponCode = activePopup?.coupon_code ?? liveCoupons[0]?.code ?? null;

  useEffect(() => {
    if (pathname !== '/') { setOpen(false); return; }
    // Don't show popup if there's no active popup configured AND no live coupons
    if (!activePopup && liveCoupons.length === 0) return;
    let dismissed = false;
    try { dismissed = Date.now() - Number(localStorage.getItem('veloura-offer-dismissed') ?? 0) < 7 * 86400000; } catch { /* Storage may be unavailable. */ }
    if (dismissed) return;
    const timer = window.setTimeout(() => setOpen(true), delayMs);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, delayMs, activePopup, liveCoupons.length]);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem('veloura-offer-dismissed', String(Date.now())); } catch { /* Still dismiss in memory. */ }
  };

  return <>
    {/* WhatsApp button — only show if number configured in settings */}
    {waNumber && (
      <Button asChild size="icon" className="whatsapp-float" title="Chat on WhatsApp">
        <a
          href={`https://wa.me/${waNumber}?text=Hello%20VEL0URA%20APPAREL%2C%20I%20have%20a%20question%20about%20a%20product.`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with VEL0URA APPAREL on WhatsApp"
        >
          <MessageCircle className="size-7" />
        </a>
      </Button>
    )}

    {/* Offer popup — only renders when there's a real coupon from DB */}
    {popupCouponCode && (
      <Dialog open={open && !isCartOpen && !isSearchOpen} onOpenChange={value => { if (!value) close(); }}>
        <DialogContent className="offer-popup max-w-md text-center">
          <Logo className="mx-auto" />
          <p className="editorial-label">YOUR FIRST LOOK, FOR LESS</p>
          <DialogTitle className="font-display text-4xl">
            {activePopup?.title ?? 'Good style.'}<br />
            {activePopup?.title ? '' : 'A better welcome.'}
          </DialogTitle>
          <DialogDescription>
            {activePopup?.message ?? `Use ${popupCouponCode} on your next order. One code per order.`}
          </DialogDescription>
          <div className="border-y border-dashed border-border py-4 font-sans text-lg font-semibold">
            {popupCouponCode}
          </div>
          <Button onClick={() => { void applyCoupon(popupCouponCode).then(ok => { if (ok) setApplied(true); }); }}>
            {applied ? <><Check /> Offer selected</> : <>Use my offer <ArrowRight /></>}
          </Button>
          <Button asChild variant="outline" onClick={close}>
            <Link to="/new-arrivals">Explore new arrivals</Link>
          </Button>
        </DialogContent>
      </Dialog>
    )}
  </>;
}