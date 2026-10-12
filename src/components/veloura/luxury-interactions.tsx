import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Plus, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { campaignImages, products, formatPrice, storeConfig, type Product } from "@/lib/veloura-data";
import { useVelouraStore } from "@/lib/veloura-store";
import { Price, QuickAdd } from "./shopping-ui";

export function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reset = () => { ref.current?.style.setProperty("--magnet-x", "0px"); ref.current?.style.setProperty("--magnet-y", "0px"); };
  return <div ref={ref} className={`luxury-magnetic ${className}`} onPointerMove={event => {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--magnet-x", `${Math.max(-3, Math.min(3, (event.clientX - rect.left - rect.width / 2) * .06))}px`);
    event.currentTarget.style.setProperty("--magnet-y", `${Math.max(-3, Math.min(3, (event.clientY - rect.top - rect.height / 2) * .06))}px`);
  }} onPointerLeave={reset} onBlur={reset}>{children}</div>;
}

export function EditorialImage({ product }: { product: Product }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState(false);
  const source = product.images[0];
  return <div ref={ref} className="editorial-image absolute inset-0" onPointerMove={event => {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    event.currentTarget.style.setProperty("--lens-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--lens-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--lens-bg-x", `${56 - x * rect.width * 2.4}px`);
    event.currentTarget.style.setProperty("--lens-bg-y", `${56 - y * rect.height * 2.4}px`);
    event.currentTarget.style.setProperty("--lens-bg-width", `${rect.width * 2.4}px`);
    event.currentTarget.style.setProperty("--lens-bg-height", `${rect.height * 2.4}px`);
    setLens(true);
  }} onPointerLeave={() => setLens(false)}>
    <img src={source} alt={product.name} width={900} height={1200} loading="lazy" className="editorial-image-main h-full w-full object-cover" />
    {product.images[1] ? <img src={product.images[1]} alt="" aria-hidden width={900} height={1200} loading="lazy" className="editorial-image-secondary absolute inset-0 h-full w-full object-cover" /> : <img src={source} alt="" aria-hidden width={900} height={1200} loading="lazy" className="editorial-image-secondary editorial-detail absolute inset-0 h-full w-full object-cover" />}
    <span className={`fabric-lens ${lens ? "is-active" : ""}`} aria-hidden="true"><img src={source} alt="" /></span>
  </div>;
}

export function ShoppableCampaign() {
  const looks = [products.find(p => p.category === "Jackets"), products.find(p => p.category === "Trousers"), products.find(p => p.category === "T-Shirts")].filter((p): p is Product => Boolean(p));
  const [active, setActive] = useState(0);
  const [quickOpen, setQuickOpen] = useState(false);
  const product = looks[active];
  if (!product) return null;
  return <section className="shoppable-campaign border-y border-border bg-secondary" aria-label="Shop the campaign">
    <div className="campaign-photo relative overflow-hidden bg-muted"><img src={campaignImages.one} alt="Men's layered streetwear campaign" width={1536} height={1024} loading="lazy" className="h-full w-full object-cover" />
      <div className="campaign-caption"><p className="text-xs uppercase">AUTUMN / WINTER 26</p><h2 className="mt-2 font-display text-4xl sm:text-6xl">The shape of now.</h2></div>
      {looks.map((item, index) => <Button key={item.id} variant="glass" size="icon" className={`campaign-pin campaign-pin-${index} ${active === index ? "is-selected" : ""}`} aria-label={`Explore ${item.name}`} aria-pressed={active === index} onClick={() => setActive(index)}><Plus /></Button>)}
    </div>
    <div className="campaign-products"><p className="editorial-label">THE CAMPAIGN / {String(active + 1).padStart(2, "0")}</p><h3 className="mt-3 font-display text-4xl">Considered layers.</h3><div className="my-7 flex gap-2">{looks.map((item, index) => <Button key={item.id} size="sm" variant={active === index ? "editorial" : "outline"} aria-pressed={active === index} onClick={() => setActive(index)}>{item.category}</Button>)}</div>
      <div key={product.id} className="campaign-product-detail grid grid-cols-[minmax(80px,0.7fr)_minmax(0,1fr)] items-center gap-5"><Link to="/product/$slug" params={{ slug: product.slug }}><img src={product.images[0]} alt={product.name} width={400} height={500} loading="lazy" className="aspect-[3/4] w-full object-cover" /></Link><div><p className="mb-2 text-xs text-muted-foreground">{product.category}</p><Link to="/product/$slug" params={{ slug: product.slug }} className="font-sans text-sm font-semibold">{product.name}</Link><div className="mt-3"><Price product={product} /></div><Magnetic className="mt-5"><Button variant="outline" size="sm" onClick={() => setQuickOpen(true)}>Quick Add <Plus /></Button></Magnetic></div></div>
      <Button asChild variant="link" className="mt-7 justify-start px-0"><Link to="/collections">Explore the collection <ArrowRight /></Link></Button>
    </div>{quickOpen ? <QuickAdd product={product} onClose={() => setQuickOpen(false)} /> : null}
  </section>;
}

// A launch date must be supplied by the brand; never manufacture scarcity.
const confirmedLaunch: string | null = null;
export function PrivateAccess() {
  const [saved, setSaved] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { try { setSaved(localStorage.getItem("veloura-private-access") === "saved"); } catch { /* Storage optional. */ }
    if (!confirmedLaunch) return;
    const target = Date.parse(confirmedLaunch);
    if (!Number.isFinite(target)) return;
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer);
  }, []);
  return <section className="private-access border-y border-border bg-muted px-5 py-16 sm:px-12" aria-label="Private access"><div className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-center"><div><p className="editorial-label flex items-center gap-2"><LockKeyhole className="size-4" />VEL0URA APPAREL / ARCHIVE</p><h2 className="mt-4 font-display text-5xl sm:text-7xl">PRIVATE ACCESS</h2><p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">The next chapter. A considered edit of silhouettes, layers and everyday essentials.</p></div><div className="border-t border-border pt-7 md:border-l md:border-t-0 md:pl-9 md:pt-0"><p className="editorial-label">NEXT RELEASE</p>{remaining !== null ? <p className="mt-4 font-display text-4xl tabular-nums">{Math.floor(remaining / 86400000)}d · {String(Math.floor(remaining / 3600000) % 24).padStart(2,"0")}h · {String(Math.floor(remaining / 60000) % 60).padStart(2,"0")}m · {String(Math.floor(remaining / 1000) % 60).padStart(2,"0")}s</p> : <p className="mt-4 font-display text-3xl">Date to be announced.</p>}<Magnetic className="mt-6"><Button variant="editorial" aria-pressed={saved} onClick={() => { try { localStorage.setItem("veloura-private-access", saved ? "" : "saved"); setSaved(!saved); setError(""); } catch { setError("Your browser could not save this preference."); } }}>{saved ? <Check /> : <Plus />}{saved ? "Edit saved" : "Save this edit"}</Button></Magnetic><p role="status" className="mt-3 text-xs leading-5 text-muted-foreground">{error || (saved ? "Saved on this device. Email alerts are not connected." : "Keep this edit on this device. No email required.")}</p><Link to="/new-arrivals" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase">Explore current arrivals <ArrowRight className="size-4" /></Link></div></div></section>;
}

export function ShippingProgress() {
  const { cartSubtotal, deliveryMethod } = useVelouraStore();
  const remaining = Math.max(0, storeConfig.freeShippingThreshold - cartSubtotal);
  const ratio = Math.min(1, cartSubtotal / storeConfig.freeShippingThreshold);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.style.setProperty("--shipping-progress", String(ratio)); }, [ratio]);
  return <div className="mb-6"><p className="mb-3 text-xs leading-5" role="status">{deliveryMethod === "Express" ? "Express shipping is charged separately." : remaining ? `${formatPrice(remaining)} away from complimentary standard delivery.` : "Complimentary standard delivery unlocked."}</p><div ref={ref} role="progressbar" aria-label="Complimentary standard delivery" aria-valuemin={0} aria-valuemax={storeConfig.freeShippingThreshold} aria-valuenow={Math.min(cartSubtotal, storeConfig.freeShippingThreshold)} className="shipping-progress"><span /></div></div>;
}