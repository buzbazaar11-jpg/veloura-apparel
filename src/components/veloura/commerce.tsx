import { Logo } from "./logo";
import { MobileShoppingNav } from "./mobile-shopping-nav";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CustomerExtras, ShoppingConfidence } from "./customer-confidence";
import { CouponInput, Price, Rating, QuickAdd, LiveReviews, ReviewForm } from "./shopping-ui";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  UserRound,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Pause,
  Play,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import bannerDrop from "@/assets/mens-campaign-everyday.jpg";
import bannerAccessories from "@/assets/mens-accessories.jpg";
import {
  articles,
  campaignImages,
  categories,
  colors,
  formatPrice,
  productPrice,
  storeConfig,
  heroSlides,
  moods,
  products,
  productsForMood,
  recommendProducts,
  sizes,
  type Product,
} from "@/lib/veloura-data";
import { useVelouraStore, type CartItem, type Order } from "@/lib/veloura-store";
import { useSettings, useHeroSlides, useBlogPosts, useProducts, useCollections, useDeals, useCoupons, apiEnabled } from "@/lib/api";
import { assetUrl, fromBackend, LiveDeals } from "@/lib/live-catalog";
import { api } from "@/lib/api";

export function SiteChrome() {
  return (
    <>
      <Navbar />
      <SearchOverlay />
      <CartDrawer />
      <MiniCart />
      <CustomerExtras />
      <MobileShoppingNav />
    </>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const { data } = useSettings();
  const groups = [
    ["Shop", "New Arrivals", "Men", "Jackets", "T-Shirts", "Accessories"],
    ["About", "Our Story", "Journal", "Contact"],
    ["Support", "Shipping", "Returns", "Size Guide", "FAQs"],
    ["Legal", "Privacy", "Terms"],
  ];

  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_2fr_1.2fr] lg:px-12">
        <div>
          <Link to="/" aria-label="VEL0URA APPAREL home"><Logo className="size-28" /></Link>
          {data?.settings?.brand_tagline ? (
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              {data.settings.brand_tagline}
            </p>
          ) : apiEnabled ? null : (
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              Modern essentials focused on clean silhouettes, thoughtful details and effortless style.
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {(!apiEnabled || data?.settings?.instagram_url) ? (
              <a className="focus-veloura" href={data?.settings?.instagram_url ?? 'https://instagram.com'} target="_blank" rel="noreferrer">
                Instagram
              </a>
            ) : null}
            {(!apiEnabled || data?.settings?.tiktok_url) ? (
              <a className="focus-veloura" href={data?.settings?.tiktok_url ?? 'https://tiktok.com'} target="_blank" rel="noreferrer">
                TikTok
              </a>
            ) : null}
            <a className="focus-veloura" href="https://pinterest.com" target="_blank" rel="noreferrer">
              Pinterest
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {groups.map((group) => (
            <div key={group[0]}>
              <h3 className="editorial-label text-foreground">{group[0]}</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {group.slice(1).map((item) => (
                  <li key={item}>
                    <Link className="focus-veloura hover:text-foreground" to={linkForFooter(item)}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <form
          className="lg:max-w-sm"
          onSubmit={(event) => {
            event.preventDefault();
            if (email.trim()) setDone(true);
          }}
        >
          <h3 className="font-display text-3xl">JOIN THE VELOURA LIST</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Get first access to new collections, exclusive drops and stories from VEL0URA APPAREL.
          </p>
          <div className="mt-6 flex gap-2 border-b border-border pb-2">
            <label className="sr-only" htmlFor="footer-email">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="min-w-0 flex-1 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground focus-veloura"
            />
            <Button type="submit" variant="ghost" size="sm">
              Subscribe
            </Button>
          </div>
          {done ? <p className="mt-3 text-sm text-sage">You are now part of the VEL0URA APPAREL world.</p> : null}
        </form>
      </div>
    </footer>
  );
}

function linkForFooter(item: string) {
  if (["Journal"].includes(item)) return "/journal";
  if (["Our Story"].includes(item)) return "/about";
  if (["New Arrivals", "Men", "Jackets", "T-Shirts", "Accessories", "Shipping", "Returns", "Size Guide", "FAQs"].includes(item)) return "/shop";
  if (["Privacy", "Terms"].includes(item)) return "/about";
  if (item === "Contact") return "/contact";
  return "/shop";
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: state => state.location.pathname });
  const home = pathname === '/';
  useEffect(() => { const update = () => setScrolled(window.scrollY > 48); update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  useEffect(() => setMobileOpen(false), [pathname]);
  const { openSearch, openCart, cartCount, wishlist } = useVelouraStore();
  const { data: settingsData } = useSettings();
  const navItems = [["Home","/"],["Shop","/shop"],["Collections","/collections"],["New Arrivals","/new-arrivals"],["Best Sellers","/best-sellers"],["Sale","/sale"]] as const;
  return <header className={`store-header relative z-40 ${home ? 'header-home' : 'header-page'} ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="announcement bg-primary px-4 py-2 text-center text-primary-foreground">{settingsData?.settings?.brand_tagline ?? storeConfig.announcement}</div>
    <nav aria-label="Main navigation" className="nav-shell">
      <Link to="/" aria-label="VEL0URA APPAREL home" className="nav-logo focus-veloura"><Logo /></Link>
      <div className="hidden min-w-0 items-center gap-5 xl:flex">{navItems.map(([label,path])=><Link key={label} to={path} className="text-xs font-semibold uppercase hover:text-sage">{label}</Link>)}</div>
      <div className="nav-actions flex shrink-0 items-center gap-0.5">
        <Button variant="ghost" size="icon" onClick={openSearch} aria-label="Search VEL0URA APPAREL"><Search /></Button>
        <Button asChild variant="ghost" size="icon" className="hidden xl:inline-flex"><Link to="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`}><Heart /></Link></Button>
        <Button variant="ghost" size="icon" onClick={openCart} aria-label={`Open cart, ${cartCount} items`} className="relative"><ShoppingBag />{cartCount ? <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">{cartCount}</span>:null}</Button>
      </div>
      <Button variant="ghost" size="icon" className="menu-toggle xl:hidden" aria-label="Open menu" aria-expanded={mobileOpen} onClick={()=>setMobileOpen(true)}><Menu /></Button>
    </nav>
    <Dialog open={mobileOpen} onOpenChange={setMobileOpen}><DialogContent className="mobile-menu-panel"><DialogTitle className="sr-only">VEL0URA APPAREL menu</DialogTitle><Logo /><div className="mt-3 grid grid-cols-2 gap-3"><Button variant="outline" onClick={()=>{setMobileOpen(false);openSearch();}}><Search />Search</Button><Button variant="outline" onClick={()=>{setMobileOpen(false);openCart();}}><ShoppingBag />Bag ({cartCount})</Button></div><div className="mt-4 flex flex-col">{navItems.map(([label,path])=><Link key={label} to={path} onClick={()=>setMobileOpen(false)} className="border-b border-border py-3 text-sm font-semibold">{label}</Link>)}<Link to="/track" onClick={()=>setMobileOpen(false)} className="border-b border-border py-3 text-sm font-semibold">Orders & tracking</Link><Link to="/wishlist" onClick={()=>setMobileOpen(false)} className="border-b border-border py-3 text-sm font-semibold">Wishlist ({wishlist.length})</Link><Link to="/contact" onClick={()=>setMobileOpen(false)} className="py-3 text-sm font-semibold">Contact</Link></div></DialogContent></Dialog>
  </header>;
}

export function HomePage() {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.length ? productsData.products.map(fromBackend) : products;
  const newArrivalItems = liveProducts.filter(p => p.newArrival).slice(0, 4);
  const signatureItems = liveProducts.filter(p => p.bestSeller || p.featured).slice(0, 4);
  return <main><HeroCarousel /><TrustStrip /><CategorySection liveProducts={liveProducts} />
    {newArrivalItems.length > 0 && <section className="store-section"><SectionHeader label="THE EVERYDAY LINEUP" title="Men's essentials. Sorted." action={<LinkText to="/shop">Shop all menswear</LinkText>} /><p className="mb-7 max-w-lg text-sm leading-6 text-muted-foreground">Start with a clean tee, add an easy shirt, finish with your favorite trousers.</p><ProductGrid products={newArrivalItems} /></section>}
    <SaleBanner /><LiveDeals /><HomeDeals />
    {signatureItems.length > 0 && <section className="store-section"><SectionHeader label="THE SIGNATURE EDIT" title="Your next go-to pieces." action={<LinkText to="/best-sellers">Explore the edit</LinkText>} /><ProductGrid products={signatureItems} /></section>}
    <EditorialBanner /><ShoppingConfidence /><BuildYourLook liveProducts={liveProducts} /><NewsletterBand />
  </main>;
}
function TrustStrip(){const { data } = useSettings();const freeAbove = data?.payment?.free_delivery_above ?? storeConfig.freeShippingThreshold;return <section aria-label="Shopping benefits" className="border-b border-border bg-secondary"><div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-5 px-5 py-5 md:grid-cols-4">{[[Truck,`Free delivery from ${formatPrice(freeAbove)}`],[RotateCcw,"Find your fit \u00b7 size guides"],[ShieldCheck,"Cash on Delivery \u00b7 demo"],[Sparkles,"WELCOME10 \u00b7 save 10%"]].map(([Icon,label])=>{const Symbol=Icon as typeof Truck; return <div key={String(label)} className="flex items-center justify-center gap-2 text-xs"><Symbol className="size-5 shrink-0 text-sage" /><span>{String(label)}</span></div>;})}</div></section>;}
function SaleBanner(){
  const { data: dealsData } = useDeals();
  const deal = dealsData?.deals?.[0];
  if (apiEnabled && !deal) return null;
  const title = deal?.title ?? "Great fits.";
  const subtitle = deal?.subtitle ?? "Up to 30% less.";
  const desc = deal?.description ?? "Jackets, tees and trousers. Selected styles, with every saving shown.";
  const ctaLabel = deal?.cta_label ?? "Shop the deals";
  const ctaHref = (deal?.cta_href ?? "/sale") as "/sale";
  const img = deal?.image_url ? assetUrl(deal.image_url) : bannerDrop;
  return <section className="sale-banner relative overflow-hidden bg-primary"><img src={img} alt="Men wearing relaxed shirts and everyday trousers" width={1536} height={1024} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /><div className="hero-shade absolute inset-0" /><div className="relative mx-auto max-w-[1500px] px-6 py-20 text-primary-foreground sm:px-12"><p className="text-xs uppercase">THE MEN'S SALE EDIT</p><h2 className="mt-4 max-w-lg font-display text-5xl sm:text-7xl">{title}<br />{subtitle}</h2><p className="mt-5 max-w-sm text-sm leading-6">{desc}</p><Button asChild variant="secondary" className="mt-7"><Link to={ctaHref}>{ctaLabel} <ArrowRight /></Link></Button></div></section>;
}
function HomeDeals(){
  const { applyCoupon } = useVelouraStore();
  const { data: couponsData } = useCoupons();
  const liveCoupons = couponsData?.coupons ?? [];
  const firstCoupon = apiEnabled ? liveCoupons[0] : { code: 'WELCOME10', discount_value: 10, discount_type: 'percent', description: 'Save 10% on your next order.', id: 'offline' };
  const [selected, setSelected] = useState(false);
  if (apiEnabled && !firstCoupon) return null;
  const code = firstCoupon?.code ?? 'WELCOME10';
  const desc = firstCoupon?.description ?? `Use ${code} on your next bag. One code per order.`;
  const discVal = firstCoupon?.discount_value ?? 10;
  const headline = firstCoupon?.discount_type === 'percent' ? `Make it yours. Save ${discVal}%.` : `Make it yours. Save ${discVal} off.`;
  return <section className="home-deals border-b border-border bg-secondary"><div className="store-section grid gap-8 md:grid-cols-[1fr_1fr]"><div><p className="editorial-label">YOUR FIRST LOOK</p><h2 className="mt-3 font-display text-4xl">{headline}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{desc}</p><Button variant="outline" className="mt-5" onClick={()=>{ void applyCoupon(code).then(ok=>{ if(ok) setSelected(true); }); }}>{selected ? <Check /> : <Plus />}{selected ? `${code} applied` : `Apply ${code}`}</Button><p className="sr-only" role="status">{selected ? `${discVal}${firstCoupon?.discount_type === 'percent' ? '%' : ''} discount applied to your bag.` : ''}</p></div><div className="border-t border-border pt-7 md:border-l md:border-t-0 md:pl-9 md:pt-0"><p className="editorial-label">EASY ON THE BUDGET</p><h2 className="mt-3 font-display text-4xl">Essentials under Rs. 5,000.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Everyday tees and finishing touches, without the extra spend.</p><Button asChild className="mt-5"><Link to="/shop" search={{category:'T-Shirts'}}>Shop everyday tees <ArrowRight /></Link></Button></div></div></section>;
}
export function Reveal({ children, className = "", as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "section" }) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref as React.Ref<HTMLDivElement>} className={`reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Tilt({ children, className = "", max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onMove = (event: React.MouseEvent) => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} className={`tilt ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

export function Parallax({ children, className = "", speed = 0.12 }: { children: React.ReactNode; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.transform = `translateY(${(-progress * speed * 100).toFixed(2)}%)`;
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [speed]);
  return (
    <div ref={ref} className={`parallax-img ${className}`}>
      {children}
    </div>
  );
}

export function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onMove = (event: React.MouseEvent) => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - rect.left - rect.width / 2) * 0.18;
    const dy = (event.clientY - rect.top - rect.height / 2) * 0.28;
    el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} className={`magnetic inline-block ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

function MarqueeStrip() {
  const { data } = useSettings();
  const items = data?.settings?.marquee_items ?? [];
  if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-border bg-primary py-4 text-primary-foreground" aria-label="VEL0URA APPAREL announcements">
      <div className="marquee-track flex w-max gap-12 whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} aria-hidden={i >= items.length} className="flex items-center gap-12 text-xs font-semibold uppercase tracking-[0.28em]">
            {item}
            <span className="h-1 w-1 rounded-full bg-sage" />
          </span>
        ))}
      </div>
    </div>
  );
}

function DropBanner() {
  const { data: dealsData } = useDeals();
  const deal = dealsData?.deals?.[1];
  if (apiEnabled && !deal) return null;
  const img = deal?.image_url ? assetUrl(deal.image_url) : bannerDrop;
  const ctaHref = (deal?.cta_href ?? "/collections") as "/collections";
  return (
    <Reveal as="section" className="px-5 sm:px-8 lg:px-12">
      <Link to={ctaHref} className="group relative mx-auto block h-[78vh] min-h-[520px] max-w-[1500px] overflow-hidden rounded-sm focus-veloura">
        <Parallax className="absolute inset-0" speed={0.1}>
          <img src={img} alt={deal?.title ?? "VEL0URA APPAREL Drop"} width={1600} height={912} loading="lazy" className="h-full w-full scale-110 object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.16]" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/15 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-8 text-primary-foreground sm:p-12 lg:p-16">
          {deal?.badge && <span className="glass-panel inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
            <span className="pulse-dot h-2 w-2 rounded-full bg-sage" /> {deal.badge}
          </span>}
          <div className="max-w-xl">
            {deal?.subtitle && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/80">{deal.subtitle}</p>}
            <h2 className="mt-4 font-display text-6xl leading-[0.9] sm:text-8xl">{deal?.title ?? ''}</h2>
            {deal?.description && <p className="mt-5 max-w-sm text-base leading-7 text-primary-foreground/85">{deal.description}</p>}
            <span className="mt-8 inline-flex items-center gap-3 border-b border-primary-foreground pb-1 text-xs font-semibold uppercase tracking-[0.24em]">
              {deal?.cta_label ?? 'Shop the drop'} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
function SplitBanners() {
  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-20 sm:px-8 md:grid-cols-[1.1fr_0.9fr] lg:px-12">
      <Reveal>
        <Link to="/shop" className="lift group relative block h-[560px] overflow-hidden rounded-sm focus-veloura">
          <img src={bannerAccessories} alt="VEL0URA APPAREL accessories: tote, sneakers and jewelry" width={1200} height={1408} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
          <div className="absolute inset-x-5 bottom-5 glass-panel-strong rounded-sm p-6">
            <p className="editorial-label">The Finishing Edit</p>
            <h3 className="mt-2 font-display text-4xl leading-none">Accessories, considered.</h3>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">Discover <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </div>
        </Link>
      </Reveal>
      <Reveal>
        <div className="flex h-[560px] flex-col gap-5">
          <Link to="/shop" className="lift group relative flex flex-1 flex-col justify-between overflow-hidden rounded-sm bg-sage p-8 text-primary-foreground focus-veloura">
            <p className="text-xs font-semibold uppercase tracking-[0.28em]">Members preview</p>
            <div>
              <p className="font-display text-7xl leading-none sm:text-8xl">15% <span className="text-4xl">off</span></p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-primary-foreground/85">Your first VEL0URA APPAREL order when you join the VEL0URA APPAREL World.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">Shop now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
          <Link to="/journal" className="lift group relative flex-1 overflow-hidden rounded-sm focus-veloura">
            <img src={campaignImages.three} alt="VEL0URA APPAREL Journal story" width={1600} height={1200} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-primary/35" />
            <div className="relative flex h-full flex-col justify-end p-8 text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.28em]">VEL0URA APPAREL Journal</p>
              <h3 className="mt-2 font-display text-4xl leading-none">Inside AW26</h3>
            </div>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function HeroCarousel() {
 const [index,setIndex]=useState(0);const [paused,setPaused]=useState(false);const touchStart=useRef<number|null>(null);
 const { data: heroData } = useHeroSlides();
 const slides = apiEnabled
   ? (heroData?.slides?.length
       ? heroData.slides.map(s => ({
           label: s.eyebrow ?? '',
           headline: s.title ?? '',
           text: s.description ?? '',
           cta: s.cta_label ?? 'Shop now',
           ctaPath: (s.cta_href ?? '/shop') as '/shop' | '/collections' | '/new-arrivals',
           image: s.image_url ? assetUrl(s.image_url) : '',
           product: s.title ?? '',
         }))
       : [])
   : heroSlides;
 const slide = slides[index] ?? slides[0];
 useEffect(()=>{if(paused || prefersReducedMotion())return;const timer=window.setInterval(()=>setIndex(i=>(i+1)%slides.length),6500);return()=>window.clearInterval(timer);},[paused, slides.length]);
 const go=(direction:number)=>setIndex(i=>(i+direction+slides.length)%slides.length);
 if (apiEnabled && !slides.length) return <div className='veloura-hero relative overflow-hidden bg-primary animate-pulse' style={{minHeight:'70vh'}} aria-hidden='true' />;
 if(!slide)return null;
 return <section id="hero" aria-roledescription="carousel" aria-label="VEL0URA APPAREL campaign" className="veloura-hero relative overflow-hidden bg-primary" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onTouchStart={e=>{touchStart.current=e.touches[0]?.clientX??null;}} onTouchEnd={e=>{const start=touchStart.current;if(start===null)return;const end=e.changedTouches[0]?.clientX??start;if(start-end>40)go(1);if(end-start>40)go(-1);touchStart.current=null;}}>
 {slides.map((hero,i)=><img key={hero.headline || i} src={hero.image} alt={i===index ? `${hero.product ?? ''} seasonal campaign` : ""} aria-hidden={i!==index} width={1600} height={1200} loading={i===0?'eager':'lazy'} fetchPriority={i===0?'high':'auto'} className={`hero-image absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i===index?'opacity-100':'opacity-0'}`} />)}
 <div className="hero-shade absolute inset-0" />
 <div className="hero-inner relative z-10 mx-auto flex h-full max-w-[1500px] flex-col justify-end text-primary-foreground">
 <div key={index} className="hero-stagger hero-copy"><p className="text-xs font-semibold uppercase">{slide.label}</p><h1 className="hero-title mt-5 font-display">VEL0URA<br />APPAREL</h1><p className="mt-5 text-xs font-semibold">{slide.headline}</p><p className="mt-3 max-w-md text-sm leading-6 text-primary-foreground/85">{slide.text}</p><div className="mt-7 flex flex-wrap gap-3"><Button asChild variant="secondary" size="lg"><Link to={slide.ctaPath}>{slide.cta}<ArrowRight /></Link></Button><Button asChild variant="outline" size="lg" className="hero-secondary border-primary-foreground/50 text-primary-foreground hover:text-foreground"><Link to="/collections">The collection</Link></Button></div><p className="mt-5 text-xs text-primary-foreground/85">Men's everyday essentials · 10% off with WELCOME10</p></div>
 <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-primary-foreground/30 pt-4"><div className="flex items-center gap-3"><span className="text-xs">0{index+1} / 0{slides.length}</span>{slides.map((h,i)=><Button key={h.headline || i} variant="ghost" size="icon" className="size-7 hover:bg-primary/20" aria-label={`Go to slide ${i+1}`} aria-current={i===index} onClick={()=>setIndex(i)}><span className={`block h-0.5 w-5 ${i===index?'bg-primary-foreground':'bg-primary-foreground/40'}`} /></Button>)}</div><div className="flex"><Button variant="ghost" size="icon" className="text-primary-foreground" aria-label={paused?'Play hero slides':'Pause hero slides'} onClick={()=>setPaused(v=>!v)}>{paused?<Play />:<Pause />}</Button><Button variant="ghost" size="icon" className="text-primary-foreground" onClick={()=>go(-1)} aria-label="Previous hero slide"><ArrowLeft /></Button><Button variant="ghost" size="icon" className="text-primary-foreground" onClick={()=>go(1)} aria-label="Next hero slide"><ArrowRight /></Button></div></div>
 </div></section>;
}
export function SectionHeader({ label, title, action }: { label: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div>
        <p className="editorial-label">{label}</p>
        <h2 className="mt-2 font-display text-4xl leading-tight sm:text-6xl">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function LinkText({ to, children }: { to: "/shop" | "/journal" | "/about" | "/collections" | "/new-arrivals" | "/best-sellers"; children: React.ReactNode }) {
  return (
    <Link to={to} className="focus-veloura text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
      {children}
    </Link>
  );
}

export function ProductGrid({ products: shownProducts }: { products: Product[] }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">{shownProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useVelouraStore();
  const wished = isWishlisted(product.id);
  const [quickOpen,setQuickOpen]=useState(false);
  return (
    <article className="group relative">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="focus-veloura block">
        <Tilt max={5}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted shadow-sm">
          <img src={product.images[0]} alt={product.name} width={900} height={1200} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
          {product.images[1] ? <img src={product.images[1]} alt={`${product.name} alternate view`} width={900} height={1200} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" /> : null}
          <div className="absolute left-2 top-2 flex max-w-[65%] flex-col items-start gap-1">
            {product.newArrival ? <Badge>NEW</Badge> : null}
            {product.bestSeller ? <Badge>BESTSELLER</Badge> : null}
            {product.stock < 8 ? <Badge>LOW STOCK</Badge> : null}
          </div>
        </div>
        </Tilt>
      </Link>
      <Button
        variant="glass"
        size="icon"
        className="absolute right-3 top-3 h-9 w-9"
        onClick={() => toggleWishlist(product.id)}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      >
        <Heart className={wished ? "fill-current text-sage" : ""} />
      </Button>
      <div className="mt-4 min-w-0"><Link to="/product/$slug" params={{slug:product.slug}} className="block text-sm font-semibold">{product.name.replace("VEL0URA APPAREL ","")}</Link><p className="my-2 text-xs text-muted-foreground">{product.category}</p><Price product={product} /><div className="mt-3 flex gap-2">{product.colors.map(color=><span title={color} key={color} className={`swatch swatch-${color.toLowerCase()}`} />)}</div></div>
      <Button variant="outline" size="sm" className="mt-4 w-full" onClick={()=>setQuickOpen(true)}>Quick Add <Plus /></Button>
      {quickOpen ? <QuickAdd product={product} onClose={()=>setQuickOpen(false)} /> : null}
    </article>
  );
}

function CompactProduct({ product }: { product: Product }) {
  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group focus-veloura block">
      <div className="aspect-[4/5] overflow-hidden rounded-sm bg-muted">
        <img src={product.images[0]} alt={product.name} width={600} height={750} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
      </div>
      <p className="mt-3 text-sm font-semibold">{product.name}</p>
      <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
    </Link>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full glass-panel px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em]">{children}</span>;
}

function BentoTile({ to, search, img, alt, tag, title, note, className = "" }: { to: string; search?: Record<string, string>; img?: string | undefined; alt: string; tag: string; title: string; note?: string; className?: string }) {
  return <Link to={to} search={search as never} className={`bento-tile group focus-veloura ${className}`}>
    {img ? <img src={img} alt={alt} width={900} height={1100} loading="lazy" className="bento-img" /> : null}
    <div className="bento-shade" />
    <span className="bento-tag">{tag}</span>
    <div className="bento-copy"><h3>{title}</h3>{note ? <p>{note}</p> : null}</div>
    <span className="bento-arrow" aria-hidden="true"><ArrowRight className="size-4" /></span>
  </Link>;
}

function CategorySection({ liveProducts }: { liveProducts: Product[] }) {
  const { addManyToCart } = useVelouraStore();
  const [added, setAdded] = useState(false);
  const find = (c: string) => liveProducts.find(p => p.category === c);
  const tee = find("T-Shirts"), trouser = find("Trousers"), jacket = find("Jackets"), acc = find("Accessories"), shirt = find("Shirts");
  const uniform = [tee, trouser].filter(Boolean) as typeof liveProducts;
  return <section className="category-section store-section"><SectionHeader label="BUILT FOR YOUR EVERYDAY" title="Find your kind of fit." />
    <div className="bento-grid">
      <BentoTile className="bento-hero" to="/shop" search={{category:"Jackets"}} img={jacket?.images[0] ?? campaignImages.one} alt="Men's jacket campaign" tag="01 / Outerwear" title="The Jacket Edit" note="Layers made for every season." />
      <BentoTile className="bento-tall" to="/shop" search={{category:"T-Shirts"}} img={tee?.images[0]} alt="Men's tees" tag="02 / Tees" title="Core Tees" note="Clean everyday cotton." />
      <BentoTile className="bento-square" to="/shop" search={{category:"Accessories"}} img={acc?.images[0]} alt="Men's accessories" tag="03 / Finish" title="Accessories" />
      <BentoTile className="bento-square" to="/shop" search={{category:"Shirts"}} img={shirt?.images[0] ?? jacket?.images[0]} alt="Men's shirts" tag="04 / Shirts" title="Easy Shirts" />
      <div className="bento-tile bento-wide bento-uniform">
        <div className="bento-uniform-imgs">{uniform.map(p=><img key={p.id} src={p.images[0]} alt={p.name} width={400} height={500} loading="lazy" />)}</div>
        <div className="bento-uniform-copy"><span className="bento-tag static">05 / The Uniform</span><h3>Complete the uniform.</h3><p>{uniform.map(p=>p.name).join(" + ")} Â· {formatPrice(uniform.reduce((s,p)=>s+p.price,0))}</p>
          <Button variant="editorial" className="magnetic-btn mt-4" onClick={()=>{addManyToCart(uniform.map(product=>({product})));setAdded(true);}}>{added ? <Check /> : <Plus />}{added ? "Added to bag" : "Add both to bag"}</Button></div>
      </div>
    </div></section>;
}

function EditorialBanner() {
  const { data: dealsData } = useDeals();
  const deal = dealsData?.deals?.[2];
  if (apiEnabled && !deal) return null;
  const img = deal?.image_url ? assetUrl(deal.image_url) : campaignImages.one;
  const ctaHref = (deal?.cta_href ?? "/collections") as "/collections";
  return <section className="mens-editorial relative overflow-hidden bg-primary"><img src={img} alt={deal?.title ?? "Men's signature jacket with everyday trousers"} width={1536} height={1024} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /><div className="hero-shade absolute inset-0" /><div className="relative mx-auto max-w-[1500px] px-6 py-20 text-primary-foreground sm:px-12"><p className="text-xs uppercase">{deal?.subtitle ?? "ONE WARDROBE. MORE POSSIBILITIES."}</p><h2 className="mt-4 max-w-lg font-display text-5xl sm:text-7xl">{deal?.title ?? "From workday to weekend."}</h2><p className="mt-5 max-w-sm text-sm leading-6">{deal?.description ?? "Start with the essentials. Build a look that feels like you."}</p><Button asChild variant="secondary" className="mt-7"><Link to={ctaHref}>{deal?.cta_label ?? "Find your look"} <ArrowRight /></Link></Button></div></section>;
}
function FeaturedProducts() {
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const large = featured[0];
  const rest = featured.slice(1);
  if (!large) return null;
  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <SectionHeader label="Featured Products" title="An editorial edit" />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Link to="/product/$slug" params={{ slug: large.slug }} className="group focus-veloura relative min-h-[640px] overflow-hidden rounded-sm">
            <img src={large.images[0]} alt={large.name} width={1200} height={1400} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
            <div className="absolute bottom-6 left-6 rounded-sm glass-panel p-5">
              <p className="editorial-label">Signature piece</p>
              <h3 className="mt-2 font-display text-4xl">{large.name}</h3>
              <p className="mt-2 text-sm">{formatPrice(large.price)}</p>
            </div>
          </Link>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <img src={campaignImages.four} alt="VEL0URA APPAREL accessories edit" width={1600} height={1200} loading="lazy" className="hidden min-h-[300px] rounded-sm object-cover lg:block" />
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-3">
              {rest.map((product) => (
                <CompactProduct key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BuildYourLook({ liveProducts: propProducts }: { liveProducts?: Product[] } = {}) {
    const { data: productsData } = useProducts();
  const liveProducts = propProducts ?? (productsData?.products?.length ? productsData.products.map(fromBackend) : products);
  const [selectedId, setSelectedId] = useState(liveProducts[0]?.id ?? "");
  const { addManyToCart } = useVelouraStore();
  const selected = liveProducts.find((product) => product.id === selectedId) ?? liveProducts[0];
  if (!selected) return null;
  const recommendations = recommendProducts(selected, 4);
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12">
      <div className="grid gap-8 rounded-sm glass-panel-strong p-5 sm:p-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="editorial-label">Build Your Look</p>
          <h2 className="mt-3 font-display text-5xl leading-none">SELECT YOUR PIECE</h2>
          <label className="mt-8 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground" htmlFor="look-piece">
            Piece
          </label>
          <select id="look-piece" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-3 w-full rounded-full border border-border bg-secondary px-4 py-3 text-sm focus-veloura">
            {liveProducts.slice(0, 12).map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <Button variant="editorial" className="mt-6" onClick={() => addManyToCart([selected, ...recommendations].map((product) => ({ product })))}>
            Add Complete Look
          </Button>
        </div>
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Complete the look</p>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
            {[selected, ...recommendations].map((product) => (
              <CompactProduct key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function JournalPreview() {
  const { data } = useBlogPosts();
  const liveArticles = data?.posts?.length
    ? data.posts.map(p => ({ slug: p.slug, title: p.title, description: p.excerpt ?? '', image: p.image_url ? assetUrl(p.image_url) : campaignImages.one, category: p.category ?? 'Journal' }))
    : articles.slice(0, 4);
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12">
      <SectionHeader label="The VEL0URA APPAREL Journal" title="Notes on modern dressing" action={<LinkText to="/journal">Read journal</LinkText>} />
      <div className="grid gap-6 md:grid-cols-4">
        {liveArticles.slice(0, 4).map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}

function AboutPreview() {
  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <img src={campaignImages.two} alt="VEL0URA APPAREL everyday design story" width={1600} height={1200} loading="lazy" className="min-h-[520px] w-full rounded-sm object-cover" />
        <div className="flex flex-col justify-center">
          <p className="editorial-label">About VEL0URA APPAREL</p>
          <h2 className="mt-4 font-display text-5xl leading-none sm:text-7xl">DESIGNED FOR EVERYDAY.</h2>
          <p className="mt-6 max-w-md leading-7 text-muted-foreground">VEL0URA APPAREL creates modern essentials focused on clean silhouettes, thoughtful details and effortless style.</p>
          <Button asChild variant="outline" className="mt-8 w-fit">
            <Link to="/about">Our Story</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  return (
    <section className="px-5 py-20 sm:px-8 lg:px-12">
      <form
        className="mx-auto max-w-4xl text-center"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim()) setSuccess(true);
        }}
      >
        <p className="editorial-label">Newsletter</p>
        <h2 className="mt-4 font-display text-5xl leading-none sm:text-7xl">JOIN THE VELOURA LIST</h2>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-muted-foreground">Get first access to new collections, exclusive drops and stories from VEL0URA APPAREL.</p>
        <div className="mx-auto mt-8 flex max-w-xl gap-2 border-b border-border pb-2">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="min-w-0 flex-1 bg-transparent text-center outline-hidden placeholder:text-muted-foreground focus-veloura sm:text-left" />
          <Button type="submit" variant="ghost" size="sm">
            Subscribe
          </Button>
        </div>
        {success ? <p className="mt-4 text-sm text-sage">You are subscribed to VEL0URA APPAREL.</p> : null}
      </form>
    </section>
  );
}

export function ArticleCard({ article }: { article: (typeof articles)[number] }) {
  return (
    <article className="group">
      <div className="aspect-[4/5] overflow-hidden rounded-sm bg-muted">
        <img src={article.image} alt={article.title} width={900} height={1125} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
      </div>
      <p className="mt-4 editorial-label">{article.category}</p>
      <h3 className="mt-2 font-display text-3xl leading-tight">{article.title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{article.description}</p>
      <Link to="/journal/$slug" params={{ slug: article.slug }} className="focus-veloura mt-3 inline-block text-xs font-semibold uppercase tracking-[0.18em] underline underline-offset-4">
        Read
      </Link>
    </article>
  );
}

export function ShopPage({ mode = "all", initialCategory = "All" }: { mode?: "all" | "new" | "best" | "sale"; initialCategory?: string }) {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.length ? productsData.products.map(fromBackend) : products;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  useEffect(()=>setCategory(initialCategory),[initialCategory]);
  const [limit,setLimit]=useState(12);
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");
  const [price, setPrice] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = liveProducts.filter((product) => {
      const matchesQuery = [product.name, product.category, product.description, product.tags.join(" ")].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || product.category === category || product.audience === category || category === "New Arrivals" && product.newArrival || category === "Sale" && Boolean(product.salePrice);
      const matchesMode = mode === "all" || mode === "new" && product.newArrival || mode === "best" && product.bestSeller || mode === "sale" && Boolean(product.salePrice);
      const matchesSize = size === "All" || product.sizes.includes(size);
      const matchesColor = color === "All" || product.colors.includes(color);
      const matchesPrice = price === "All" || (price === "Under Rs. 4,000" ? productPrice(product) < 4000 : price === "Rs. 4,000â€“8,000" ? productPrice(product) >= 4000 && productPrice(product) <= 8000 : productPrice(product) > 8000);
      const matchesAvailability = availability === "All" || (availability === "In Stock" ? product.stock > 0 : product.stock > 0 && product.stock < 8);
      return matchesMode && matchesQuery && matchesCategory && matchesSize && matchesColor && matchesPrice && matchesAvailability;
    });
    if (sort === "Newest") list = [...list].sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    if (sort === "Price: Low to High") list = [...list].sort((a, b) => productPrice(a) - productPrice(b));
    if (sort === "Price: High to Low") list = [...list].sort((a, b) => productPrice(b) - productPrice(a));
    if (sort === "Featured") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    if (sort === "Best Rated") list = [...list].sort((a,b)=>b.rating-a.rating);
    if (sort === "Best Selling") list = [...list].sort((a,b)=>b.reviewCount-a.reviewCount);
    return list;
  }, [query, category, size, color, price, availability, sort, mode]);

  const filters = (
    <FilterPanel
      query={query}
      setQuery={setQuery}
      category={category}
      setCategory={setCategory}
      size={size}
      setSize={setSize}
      color={color}
      setColor={setColor}
      price={price}
      setPrice={setPrice}
      availability={availability}
      setAvailability={setAvailability}
      sort={sort}
      setSort={setSort}
    />
  );

  return (
    <main className="mx-auto max-w-[1500px] px-5 pb-20 pt-32 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="editorial-label">Shop</p>
          <h1 className="mt-3 font-display text-6xl leading-none sm:text-8xl">{mode === "new" ? "NEW ARRIVALS" : mode === "best" ? "BEST SELLERS" : mode === "sale" ? "THE SALE EDIT" : "SHOP VEL0URA APPAREL"}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} pieces</p>
      </div>
      <div className="lg:hidden">
        <Button variant="glass" onClick={() => setMobileFilters(true)}>
          <SlidersHorizontal /> Filters
        </Button>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>
        <section>
          {filtered.length ? <><ProductGrid products={filtered.slice(0,limit)} />{filtered.length>limit?<Button variant="outline" className="mx-auto mt-10 flex" onClick={()=>setLimit(v=>v+12)}>Load More</Button>:null}</> : <p className="py-20 text-center text-muted-foreground">No VEL0URA APPAREL products match these filters.</p>}
        </section>
      </div>
      {mobileFilters ? (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm lg:hidden" role="dialog" aria-modal="true">
          <div className="ml-auto h-full w-[90%] max-w-sm overflow-y-auto glass-panel-strong p-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-3xl">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileFilters(false)} aria-label="Close filters">
                <X />
              </Button>
            </div>
            {filters}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function FilterPanel(props: {
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  size: string;
  setSize: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  availability: string;
  setAvailability: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
}) {
  return (
    <div className="sticky top-28 rounded-sm glass-panel p-4">
      <FilterInput label="Search" value={props.query} onChange={props.setQuery} />
      <FilterSelect label="Category" value={props.category} onChange={props.setCategory} options={["All", "Men", "Sale", "New Arrivals", ...categories]} />
      <FilterSelect label="Size" value={props.size} onChange={props.setSize} options={["All", ...sizes, "36", "37", "38", "39", "40", "41", "42", "43", "44", "ONE SIZE"]} />
      <FilterSelect label="Color" value={props.color} onChange={props.setColor} options={["All", ...colors]} />
      <FilterSelect label="Price" value={props.price} onChange={props.setPrice} options={["All", "Under Rs. 4,000", "Rs. 4,000â€“8,000", "Over Rs. 8,000"]} />
      <FilterSelect label="Availability" value={props.availability} onChange={props.setAvailability} options={["All", "In Stock", "Low Stock"]} />
      <FilterSelect label="Sort" value={props.sort} onChange={props.setSort} options={["Featured", "Newest", "Price: Low to High", "Price: High to Low", "Best Rated", "Best Selling"]} />
    </div>
  );
}

function FilterInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mb-4 block">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-full border border-border bg-secondary px-4 py-3 text-sm focus-veloura" placeholder="Search VEL0URA APPAREL" />
    </label>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="mb-4 block">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span className="relative mt-2 block">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-full border border-border bg-secondary px-4 py-3 pr-10 text-sm focus-veloura">
          {Array.from(new Set(options)).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </span>
    </label>
  );
}

export function ProductDetailPage({ product }: { product: Product }) {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.length ? productsData.products.map(fromBackend) : products;
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "ONE SIZE");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "Ivory");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { recentlyViewed, viewProduct, addToCart, addManyToCart, toggleWishlist, isWishlisted } = useVelouraStore();
  useEffect(()=>viewProduct(product.id),[product.id,viewProduct]);
  const navigate = useNavigate();
  const recommendations = recommendProducts(product, 3);
  const wished = isWishlisted(product.id);

  return (
    <main className="mx-auto max-w-[1500px] px-5 pb-20 pt-32 sm:px-8 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr]">
        <ProductGallery product={product} />
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="editorial-label">{product.category}</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">{product.name}</h1>
          <div className="mt-5"><Price product={product} /><div className="mt-3"><Rating product={product} /></div></div>
          <p className="mt-6 max-w-lg leading-7 text-muted-foreground">{product.description}</p>
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Color: {selectedColor}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <Button key={color} variant={selectedColor === color ? "editorial" : "outline"} size="chip" onClick={() => setSelectedColor(color)}>
                  {color}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Size</p>
              <button onClick={() => setSizeGuideOpen(true)} className="focus-veloura text-xs uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4">
                Size guide
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <Button key={size} variant={selectedSize === size ? "editorial" : "outline"} size="chip" onClick={() => setSelectedSize(size)}>
                  {size}
                </Button>
              ))}
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{product.stock < 8 ? `LOW STOCK â€” ${product.stock} LEFT` : "IN STOCK"}</p>
          <div className="mt-6 flex items-center gap-3">
            <Quantity value={quantity} onChange={setQuantity} />
            <Button variant="editorial" className="flex-1" onClick={() => addToCart(product, selectedSize, selectedColor, quantity)}>
              Add to Cart
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button
              variant="sage"
              onClick={() => {
                addToCart(product, selectedSize, selectedColor, quantity);
                navigate({ to: "/checkout" });
              }}
            >
              Buy Now
            </Button>
            <Button variant="outline" onClick={() => toggleWishlist(product.id)}>
              <Heart className={wished ? "fill-current text-sage" : ""} /> Wishlist
            </Button>
          </div>
          <ProductAccordions product={product} />
        </aside>
      </div>
      <section className="mt-20">
        <SectionHeader label="Complete the Look" title="Wear it with" />
        <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
          <div className="rounded-sm glass-panel p-5">
            <p className="text-sm font-semibold">{product.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">Recommended with pieces that share tone, silhouette and VEL0URA APPAREL styling tags.</p>
            <Button className="mt-6" variant="editorial" onClick={() => addManyToCart([product, ...recommendations].map((item) => ({ product: item })))}>
              Add Complete Look
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
            {recommendations.map((item) => (
              <LookProduct key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
      <section className="mt-16"><SectionHeader label="Reviews" title="Worn. Loved. Repeated." /><Rating product={product} /><LiveReviews productId={product.id} fallbackCount={product.reviewCount} /><div className="mt-10 border-t border-border pt-8"><h3 className="font-display text-3xl">Leave a Review</h3><ReviewForm productId={product.id} /></div></section>
      {recentlyViewed.filter(id=>id!==product.id).length ? <section className="mt-16"><SectionHeader label="Recently viewed" title="Another look." /><ProductGrid products={liveProducts.filter(p=>recentlyViewed.includes(p.id)&&p.id!==product.id).slice(0,4)} /></section>:null}
      {sizeGuideOpen ? <SizeGuide onClose={() => setSizeGuideOpen(false)} /> : null}
    </main>
  );
}

function ProductGallery({ product }: { product: Product }) {
  const [image, setImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touchStart = useRef<number | null>(null);
  return (
    <div
      onTouchStart={(event) => (touchStart.current = event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const end = event.changedTouches[0]?.clientX ?? touchStart.current;
        if (touchStart.current - end > 40) setImage((current) => (current + 1) % product.images.length);
        if (end - touchStart.current > 40) setImage((current) => (current - 1 + product.images.length) % product.images.length);
        touchStart.current = null;
      }}
    >
      <button className="group aspect-[4/5] w-full overflow-hidden rounded-sm bg-muted focus-veloura" onClick={() => setZoom((value) => !value)} aria-label="Zoom product image">
        <img src={product.images[image]} alt={product.name} width={1200} height={1500} className={`h-full w-full object-cover transition-transform duration-500 ${zoom ? "scale-125" : "group-hover:scale-[1.03]"}`} />
      </button>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {product.images.map((src, index) => (
          <button key={src} onClick={() => setImage(index)} className={`aspect-[4/5] overflow-hidden rounded-sm focus-veloura ${index === image ? "ring-2 ring-sage" : ""}`} aria-label={`Show image ${index + 1}`}>
            <img src={src} alt={`${product.name} thumbnail ${index + 1}`} width={320} height={400} loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductAccordions({ product }: { product: Product }) {
  const rows = [
    ["Description", product.description],
    ["The Fit", product.fit],
    ["Material", product.material],
    ["Care", product.care],
    ["Delivery", "Complimentary standard delivery on orders over Rs. 15,000. Standard delivery arrives in 3â€“5 business days."],
    ["Returns", "Returns are accepted within 14 days on unworn VEL0URA APPAREL pieces with original tags attached."],
  ];
  return (
    <div className="mt-8 border-t border-border">
      {rows.map(([title, body]) => (
        <details key={title} className="group border-b border-border py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.18em]">
            {title}
            <Plus className="size-4 transition-transform group-open:rotate-45" />
          </summary>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
        </details>
      ))}
    </div>
  );
}

function Quantity({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex h-11 items-center rounded-full border border-border bg-secondary">
      <Button variant="ghost" size="icon" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity">
        <Minus />
      </Button>
      <span className="w-8 text-center text-sm">{value}</span>
      <Button variant="ghost" size="icon" onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        <Plus />
      </Button>
    </div>
  );
}

function LookProduct({ product }: { product: Product }) {
  const { addToCart } = useVelouraStore();
  return (
    <div className="grid grid-cols-[100px_1fr] gap-4 rounded-sm bg-secondary p-3 sm:grid-cols-1">
      <img src={product.images[0]} alt={product.name} width={400} height={500} loading="lazy" className="aspect-[4/5] w-full rounded-sm object-cover" />
      <div>
        <Link to="/product/$slug" params={{ slug: product.slug }} className="focus-veloura text-sm font-semibold hover:text-sage">
          {product.name}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">{formatPrice(product.price)}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => addToCart(product)}>
          Add
        </Button>
      </div>
    </div>
  );
}

export function SizeGuide({ onClose }: { onClose: () => void }) {
  const rows = [
    ["XS", "32", "24", "24"],
    ["S", "36", "30", "27"],
    ["M", "38", "32", "28"],
    ["L", "40", "34", "29"],
    ["XL", "42", "36", "30"],
    ["XXL", "44", "36", "29"],
  ];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="size-guide-title">
      <div className="w-full max-w-2xl rounded-sm glass-panel-strong p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="editorial-label">VEL0URA APPAREL</p>
            <h2 id="size-guide-title" className="mt-2 font-display text-4xl">Size Guide</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close size guide">
            <X />
          </Button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="py-3">Size</th>
                <th>Chest</th>
                <th>Waist</th>
                <th>Length</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} className="border-b border-border">
                  {row.map((cell,index) => (
                    <td key={index} className="py-3">{cell}{index ? " in" : ""}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.18em]">How to measure</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Measure chest around the fullest point, waist at the natural crease and length from shoulder point to hem. Keep tape relaxed for an VEL0URA APPAREL fit.</p>
      </div>
    </div>
  );
}

function SearchOverlay() {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.length ? productsData.products.map(fromBackend) : products;
  const { isSearchOpen, closeSearch } = useVelouraStore();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!query.trim()) return liveProducts.slice(0, 6);
    return liveProducts.filter((product) => [product.name, product.category, product.tags.join(" ")].join(" ").toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
  }, [query]);
  useEffect(() => {
    if (isSearchOpen) setQuery("");
  }, [isSearchOpen]);
  const [recent,setRecent]=useState<string[]>([]);
  useEffect(()=>{try{setRecent(JSON.parse(localStorage.getItem("veloura-searches")??"[]"));}catch{}},[]);
  if (!isSearchOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <div className="mx-auto mt-6 max-w-4xl rounded-sm glass-panel-strong p-5 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="editorial-label">Search</p>
            <h2 id="search-title" className="mt-2 font-display text-5xl">SEARCH VEL0URA APPAREL</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={closeSearch} aria-label="Close search">
            <X />
          </Button>
        </div>
        <label className="mt-8 block">
          <span className="sr-only">Search products</span>
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try jacket, trouser or sage" className="w-full border-b border-border bg-transparent py-4 text-2xl outline-hidden placeholder:text-muted-foreground focus-veloura" />
        </label>
        <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="ghost" onClick={()=>setQuery("")}>Clear search</Button>{recent.map(term=><Button key={term} size="sm" variant="outline" onClick={()=>setQuery(term)}>{term}</Button>)}</div>
        <div className="mt-8 grid gap-3">{!results.length?<p>No pieces found. Try another style or color.</p>:null}
          {results.map((product) => (
            <Link key={product.id} to="/product/$slug" params={{ slug: product.slug }} onClick={()=>{if(query.trim()){const next=[query.trim(),...recent.filter(t=>t!==query.trim())].slice(0,5);setRecent(next);localStorage.setItem("veloura-searches",JSON.stringify(next));}closeSearch();}} className="search-result grid grid-cols-[56px_minmax(0,1fr)] sm:grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 rounded-sm p-2 transition-colors hover:bg-secondary focus-veloura">
              <img src={product.images[0]} alt={product.name} width={144} height={180} loading="lazy" className="aspect-[4/5] rounded-sm object-cover" />
              <span>
                <span className="block text-sm font-semibold">{product.name}</span>
                <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-muted-foreground">{product.category}</span>
              </span>
              <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CartDrawer() {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.length ? productsData.products.map(fromBackend) : products;
  const { isCartOpen, closeCart, cart, updateQuantity, removeFromCart, cartSubtotal, shipping, cartTotal, discount } = useVelouraStore();
  if (!isCartOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div className="ml-auto flex h-full w-full max-w-md flex-col glass-panel-strong">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <p className="editorial-label">VEL0URA APPAREL</p>
            <h2 id="cart-title" className="mt-2 font-display text-4xl">Your Bag</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={closeCart} aria-label="Close cart">
            <X />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length ? (
            <div className="space-y-5">
              {cart.map((item) => {
                const product = liveProducts.find((candidate: Product) => candidate.id === item.productId);
                if (!product) return null;
                return <CartLine key={`${item.productId}-${item.size}-${item.color}`} item={item} product={product} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />;
              })}
            </div>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <p className="font-display text-4xl">Your bag is empty</p>
                <Button asChild variant="editorial" className="mt-6" onClick={closeCart}>
                  <Link to="/shop">Explore VEL0URA APPAREL</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-border p-5">
          <CouponInput />
          <SummaryRow label="Subtotal" value={formatPrice(cartSubtotal)} />
          {discount ? <SummaryRow label="Discount" value={`âˆ’${formatPrice(discount)}`} /> : null}
          <SummaryRow label="Shipping" value={shipping ? formatPrice(shipping) : "Complimentary"} />
          <SummaryRow label="Total" value={formatPrice(cartTotal)} strong />
          <Button asChild variant="editorial" className="mt-5 w-full" disabled={!cart.length} onClick={closeCart}>
            <Link to="/checkout">Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CartLine({ item, product, updateQuantity, removeFromCart }: { item: CartItem; product: Product; updateQuantity: (productId: string, size: string, color: string, quantity: number) => void; removeFromCart: (productId: string, size: string, color: string) => void }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-4">
      <img src={product.images[0]} alt={product.name} width={192} height={240} loading="lazy" className="aspect-[4/5] rounded-sm object-cover" />
      <div>
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{product.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.size} / {item.color}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.productId, item.size, item.color)} aria-label={`Remove ${product.name}`}>
            <Trash2 />
          </Button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Quantity value={item.quantity} onChange={(quantity) => updateQuantity(item.productId, item.size, item.color, quantity)} />
          <p className="text-sm font-semibold">{formatPrice(productPrice(product) * item.quantity)}</p>
        </div>
      </div>
    </div>
  );
}

function MiniCart() {
  const { miniCart, openCart, dismissMiniCart } = useVelouraStore();
  if (!miniCart) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-sm rounded-sm glass-panel-strong p-4 shadow-sm">
      <p className="editorial-label text-foreground">Added to your bag</p>
      <div className="mt-3 grid grid-cols-[72px_1fr] gap-3">
        <img src={miniCart.images[0]} alt={miniCart.name} width={144} height={180} loading="lazy" className="aspect-[4/5] rounded-sm object-cover" />
        <div>
          <p className="text-sm font-semibold">{miniCart.name}</p><p className="mt-1 text-xs text-muted-foreground">Size: {miniCart.size} Â· Color: {miniCart.color}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="editorial" size="sm" onClick={openCart}>View Bag</Button>
            <Button asChild variant="outline" size="sm" onClick={dismissMiniCart}><Link to="/checkout">Checkout</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between py-2 text-sm ${strong ? "text-base font-semibold" : "text-muted-foreground"}`}><span>{label}</span><span>{value}</span></div>;
}

export function WishlistPage() {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.length ? productsData.products.map(fromBackend) : products;
  const { wishlist, moveWishlistToCart, removeWishlist } = useVelouraStore();
  const wished = liveProducts.filter((product: Product) => wishlist.includes(product.id));
  return (
    <main className="mx-auto max-w-[1500px] px-5 pb-20 pt-32 sm:px-8 lg:px-12">
      <p className="editorial-label">Wishlist</p>
      <h1 className="mt-3 font-display text-6xl leading-none sm:text-8xl">YOUR WISHLIST</h1>
      {wished.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wished.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="editorial" size="sm" onClick={() => moveWishlistToCart(product)}>Move to cart</Button>
                <Button variant="outline" size="sm" onClick={() => removeWishlist(product.id)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[45vh] place-items-center text-center">
          <div>
            <h2 className="font-display text-4xl">YOUR WISHLIST IS WAITING</h2>
            <Button asChild variant="editorial" className="mt-6">
              <Link to="/shop">Explore VEL0URA APPAREL</Link>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, shipping, cartTotal, discount, coupon, deliveryMethod, setDeliveryMethod, createOrder } = useVelouraStore();
  const { data: settingsData } = useSettings();

  const paymentMethods: string[] = [];
  if (settingsData?.payment?.cod_enabled !== false) paymentMethods.push('Cash on Delivery');
  if (settingsData?.payment?.easypaisa_enabled) paymentMethods.push(`EasyPaisa · ${settingsData.payment.easypaisa_number ?? ''}`);
  if (settingsData?.payment?.jazzcash_enabled) paymentMethods.push(`JazzCash · ${settingsData.payment.jazzcash_number ?? ''}`);
  if (settingsData?.payment?.bank_enabled) paymentMethods.push(`Bank Transfer · ${settingsData.payment.bank_name ?? ''}`);
  if (!paymentMethods.length) paymentMethods.push('Cash on Delivery', 'Card — Demo', 'Online Payment — Demo');

  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] ?? "Cash on Delivery");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const order = createOrder({
      customer: {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
      },
      address: {
        address: String(form.get("address") ?? ""),
        city: String(form.get("city") ?? ""),
        postalCode: String(form.get("postalCode") ?? ""),
        country: String(form.get("country") ?? ""),
        state: String(form.get("state") ?? ""),
      },
      paymentMethod, discount, coupon,
      items: cart,
      subtotal: cartSubtotal,
      shipping,
      total: cartTotal,
    });
    navigate({ to: "/order/$id", params: { id: order.id } });
  }

  if (!cart.length) {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <h1 className="font-display text-5xl">Your VEL0URA APPAREL bag is empty</h1>
          <Button asChild variant="editorial" className="mt-6">
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1300px] px-5 pb-20 pt-32 sm:px-8 lg:px-12">
      <p className="editorial-label">Checkout</p>
      <Logo className="mt-5 size-24" /><h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">CHECKOUT</h1><p className="mt-4 text-sm text-muted-foreground">Local demo checkout. No real payment is taken and no order is sent.</p>
      <form onSubmit={submit} className="mt-12 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <CheckoutGroup title="Contact">
            <CheckoutInput name="name" label="Name" required />
            <CheckoutInput name="email" label="Email" type="email" required />
            <CheckoutInput name="phone" label="Phone" type="tel" required />
          </CheckoutGroup>
          <CheckoutGroup title="Delivery">
            <CheckoutInput name="address" label="Address" required />
            <div className="grid gap-4 sm:grid-cols-3">
              <CheckoutInput name="city" label="City" required />
              <CheckoutInput name="state" label="Province / State" required />
               <CheckoutInput name="postalCode" label="Postal Code" required />
              <CheckoutInput name="country" label="Country" required />
            </div>
          </CheckoutGroup>
          <CheckoutGroup title="Delivery method"><div className="flex flex-wrap gap-3">{["Standard","Express"].map(method=><Button type="button" key={method} variant={deliveryMethod===method?"editorial":"outline"} onClick={()=>setDeliveryMethod(method)}>{method} Â· {method==="Express"?"1â€“2 days":"3â€“5 days"}</Button>)}</div></CheckoutGroup>
          <CheckoutGroup title="Payment">
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => (
                <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`rounded-sm border border-border p-4 text-left text-sm focus-veloura ${paymentMethod === method ? "bg-secondary ring-2 ring-sage" : "bg-transparent"}`}>{method}</button>
              ))}
            </div>
            {settingsData?.payment?.payment_note ? <p className="mt-3 text-sm text-muted-foreground">{settingsData.payment.payment_note}</p> : null}
          </CheckoutGroup>
        </div>
        <OrderSummary cart={cart} subtotal={cartSubtotal} shipping={shipping} total={cartTotal} actionLabel="Place Order" />
      </form>
    </main>
  );
}

function CheckoutGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-sm bg-secondary p-5"><h2 className="editorial-label text-foreground">{title}</h2><div className="mt-5 grid gap-4">{children}</div></section>;
}

function CheckoutInput({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <input name={name} type={type} required={required} minLength={name === "name" ? 2 : name === "address" ? 5 : undefined} pattern={name === "phone" ? "[+0-9() -]{7,20}" : name === "postalCode" ? "[A-Za-z0-9 -]{3,10}" : undefined} className="mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus-veloura" />
    </label>
  );
}

export function OrderSummary({ cart, subtotal, shipping, total, actionLabel, orderDiscount }: { cart: CartItem[]; subtotal: number; shipping: number; total: number; actionLabel?: string; orderDiscount?: number }) {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.length ? productsData.products.map(fromBackend) : products;
  const {discount} = useVelouraStore();
  return (
    <aside className="h-fit rounded-sm glass-panel-strong p-5 lg:sticky lg:top-28">
      <h2 className="font-display text-3xl">Order Summary</h2>
      <div className="mt-5 space-y-4">
        {cart.map((item) => {
          const product = liveProducts.find((candidate: Product) => candidate.id === item.productId);
          if (!product) return null;
          return <div key={`${item.productId}-${item.size}-${item.color}`} className="grid grid-cols-[64px_1fr_auto] gap-3 text-sm"><img src={product.images[0]} alt={product.name} width={128} height={160} loading="lazy" className="aspect-[4/5] rounded-sm object-cover" /><span><span className="block font-semibold">{product.name}</span><span className="text-muted-foreground">Qty {item.quantity}</span></span><span>{formatPrice(productPrice(product) * item.quantity)}</span></div>;
        })}
      </div>
      <div className="mt-6 border-t border-border pt-4">
        {actionLabel ? <CouponInput /> : null}
        <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
        {(orderDiscount ?? (actionLabel ? discount : 0)) > 0 ? <SummaryRow label="Discount" value={`âˆ’${formatPrice(orderDiscount ?? discount)}`} /> : null}
        <SummaryRow label="Shipping" value={shipping ? formatPrice(shipping) : "Complimentary"} />
        <SummaryRow label="Total" value={formatPrice(total)} strong />
      </div>
      {actionLabel ? <Button type="submit" variant="editorial" className="mt-5 w-full">{actionLabel}</Button> : null}
    </aside>
  );
}

export function OrderConfirmationPage({ order }: { order: Order | undefined }) {
  if (!order) {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <h1 className="font-display text-5xl">Order not found</h1>
          <Button asChild variant="editorial" className="mt-6"><Link to="/track">Track order</Link></Button>
        </div>
      </main>
    );
  }
  const estimated = new Date(Date.parse(order.date) + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  return (
    <main className="mx-auto max-w-[1100px] px-5 pb-20 pt-32 sm:px-8 lg:px-12">
      <div className="rounded-sm bg-secondary p-6 text-center sm:p-10">
        <p className="mx-auto grid size-12 place-items-center rounded-full bg-sage text-sage-foreground"><Check /></p>
        <p className="mt-6 editorial-label">{order.id}</p>
        <h1 className="mt-3 font-display text-6xl leading-none sm:text-8xl">ORDER CONFIRMED</h1>
        <p className="mt-5 text-muted-foreground">Thank you for choosing VEL0URA APPAREL. This is a demo order; no real order was submitted.</p>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <OrderSummary cart={order.items} orderDiscount={order.discount} subtotal={order.subtotal} shipping={order.shipping} total={order.total} />
        <aside className="rounded-sm glass-panel p-5 text-sm leading-7 text-muted-foreground">
          <h2 className="font-display text-3xl text-foreground">Delivery</h2>
          <p className="mt-4">{order.address.address}</p>
          <p>{order.address.city}, {order.address.postalCode}</p>
          <p>{order.address.country}</p>
          <p className="mt-4">Payment: {order.paymentMethod}</p>
          <p>Estimated delivery: {estimated}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="editorial"><Link to="/track">Track Order</Link></Button>
            <Button asChild variant="outline"><Link to="/shop">Continue Shopping</Link></Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function TrackOrderPage() {
  const { findOrder, orders } = useVelouraStore();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState(false);
  const [remote, setRemote] = useState<{ order_number: string; status: string; status_history?: { status: string; at: string }[] } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { const o = orders[0]; if (o && !orderId) { setOrderId(o.backendOrderNumber ?? o.id); setEmail(o.customer.email); } }, [orders]); // eslint-disable-line react-hooks/exhaustive-deps
  const local = searched ? orders.find(o => o.id.toUpperCase() === orderId.trim().toUpperCase() || o.backendOrderNumber?.toUpperCase() === orderId.trim().toUpperCase()) ?? findOrder(orderId) : undefined;
  const lookup = async () => {
    setError(""); setRemote(null);
    if (apiEnabled) {
      const number = local?.backendOrderNumber ?? orders.find(o => o.id.toUpperCase() === orderId.trim().toUpperCase())?.backendOrderNumber ?? orderId.trim();
      try { const r = await api.trackOrder(number, email.trim()); setRemote(r.order); } catch (e) { setError((e as Error).message); }
    }
    setSearched(true);
  };
  // Live refresh of status every second while viewing
  useEffect(() => {
    if (!apiEnabled || !remote) return;
    const t = window.setInterval(() => { api.trackOrder(remote.order_number, email.trim()).then(r => setRemote(r.order)).catch(() => {}); }, 1000);
    return () => window.clearInterval(t);
  }, [remote?.order_number, email]); // eslint-disable-line react-hooks/exhaustive-deps
  const steps = ["CONFIRMED", "PROCESSING", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"];
  const map: Record<string, number> = { pending: 0, confirmed: 0, processing: 1, shipped: 2, out_for_delivery: 3, "out for delivery": 3, delivered: 4 };
  const status = remote?.status?.toLowerCase() ?? "";
  const cancelled = status === "cancelled" || status === "canceled";
  const current = remote ? (map[status] ?? 0) : 0;
  const found = remote || local;
  return (
    <main className="mx-auto max-w-4xl px-5 pb-20 pt-32 sm:px-8 lg:px-12">
      <p className="editorial-label">Order Tracking</p>
      <h1 className="mt-3 font-display text-6xl leading-none sm:text-8xl">TRACK YOUR VEL0URA APPAREL ORDER</h1>
      <form className="mt-10 rounded-sm glass-panel p-5" onSubmit={(e) => { e.preventDefault(); void lookup(); }}>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Order Number</span>
          <input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="VA2610138F92" className="mt-2 w-full rounded-sm border border-border bg-secondary px-4 py-3 text-sm focus-veloura" />
        </label>
        {apiEnabled ? <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Email used at checkout</span>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-sm border border-border bg-secondary px-4 py-3 text-sm focus-veloura" />
        </label> : null}
        <Button type="submit" className="mt-4" variant="editorial">Track Order</Button>
      </form>
      {searched ? (
        found && !(apiEnabled && error && !local) ? (
          <div className="mt-10 rounded-sm bg-secondary p-6">
            <p className="editorial-label">{remote?.order_number ?? local?.backendOrderNumber ?? local?.id}{cancelled ? " · CANCELLED" : ""}</p>
            <div className="mt-8 space-y-5">
              {steps.map((step, index) => {
                const done = !cancelled && index <= current;
                const at = remote?.status_history?.find(h => (map[h.status.toLowerCase()] ?? -1) === index)?.at;
                return (
                <div key={step} className="flex gap-4">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${done ? "bg-sage text-sage-foreground" : "bg-background text-muted-foreground"}`}>{done ? <Check className="size-4" /> : index + 1}</span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em]">{step}</p>
                    <p className="text-sm text-muted-foreground">{done ? (at ? new Date(at).toLocaleString() : "Completed") : "Pending"}</p>
                  </div>
                </div>);
              })}
            </div>
          </div>
        ) : (
          <p className="mt-8 text-muted-foreground">{error || "No VEL0URA APPAREL order found with that number."}</p>
        )
      ) : null}
    </main>
  );
}

export function JournalPage() {
  const { data } = useBlogPosts();
  const liveArticles = data?.posts?.length
    ? data.posts.map(p => ({ slug: p.slug, title: p.title, description: p.excerpt ?? '', image: p.image_url ? assetUrl(p.image_url) : campaignImages.one, category: p.category ?? 'Journal' }))
    : articles;
  return (
    <main className="mx-auto max-w-[1500px] px-5 pb-20 pt-32 sm:px-8 lg:px-12">
      <p className="editorial-label">Journal</p>
      <h1 className="mt-3 font-display text-6xl leading-none sm:text-8xl">THE VEL0URA APPAREL JOURNAL</h1>
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {liveArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}
      </div>
    </main>
  );
}

export function AboutPage() {
  return (
    <main className="pb-20 pt-28">
      <section className="mx-auto grid max-w-[1500px] gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-12">
        <div className="flex flex-col justify-center py-12">
          <p className="editorial-label">About VEL0URA APPAREL</p>
          <h1 className="mt-4 font-display text-6xl leading-none sm:text-8xl">DESIGNED FOR EVERYDAY.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">VEL0URA APPAREL creates modern essentials focused on clean silhouettes, thoughtful details and effortless style.</p>
          <p className="mt-5 max-w-lg leading-7 text-muted-foreground">Every piece is developed as part of a complete wardrobe: refined, versatile and calm enough to be worn repeatedly without losing impact.</p>
        </div>
        <img src={campaignImages.one} alt="VEL0URA APPAREL brand story" width={1600} height={1200} loading="lazy" className="min-h-[620px] w-full rounded-sm object-cover" />
      </section>
      <NewsletterBand />
    </main>
  );
}

export function CollectionsPage() {
  return (
    <main>
      <EditorialBanner />
      <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12">
        <SectionHeader label="VEL0URA APPAREL Collection" title="Signature essentials" />
        <ProductGrid products={products.filter((product) => product.tags.includes("signature") || product.featured)} />
      </section>
      <BuildYourLook />
    </main>
  );
}
