import { Logo } from "./logo";
import { MobileShoppingNav } from "./mobile-shopping-nav";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CustomerExtras, ShoppingConfidence } from "./customer-confidence";
import { CouponInput, Price, Rating, QuickAdd, LiveReviews, ReviewForm } from "./shopping-ui";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Home,
  PackageCheck,
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
  MapPin,
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
const bannerDrop        = "https://res.cloudinary.com/zwikhwxn/image/upload/f_auto,q_auto/veloura/assets/mens-campaign-everyday.jpg";
const bannerAccessories = "https://res.cloudinary.com/zwikhwxn/image/upload/f_auto,q_auto/veloura/assets/mens-accessories.jpg";
import {
  articles,
  campaignImages,
  categories,
  colors,
  formatPrice,
  productPrice,
  storeConfig,
  sizes,
  type Product,
} from "@/lib/veloura-data";
import { useVelouraStore, type CartItem, type Order } from "@/lib/veloura-store";
import { useSettings, useHeroSlides, useBlogPosts, useProducts, useCollections, useDeals, useCoupons, apiEnabled, useCategories, usePopups } from "@/lib/api";
import { assetUrl, fromBackend } from "@/lib/live-catalog";
import { SHOP_DEPARTMENTS, normalizeAudience, matchesDepartment } from "@/lib/product-audience";
import { api, authStorage } from "@/lib/api";
import { useCurrency, CURRENCIES, getActiveCurrency, type CurrencyCode } from "@/lib/currency";

export function SiteChrome() {
  return (
    <>
      <Navbar />
      <SearchOverlay />
      <CartDrawer />
      <MiniCart />
      <CustomerExtras />
      <MobileShoppingNav />
      <StorefrontPopup />
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
          <Link to="/" aria-label="VELOURA APPAREL home" className="inline-block"><Logo className="justify-start text-left" /></Link>
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
      <div className="border-t border-border/60 py-6 px-5 sm:px-8 lg:px-12 bg-secondary/70">
        <div className="mx-auto max-w-[1500px] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} VEL0URA APPAREL. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium">
            <span>Powered by</span>
            <a
              href="https://amenterprise.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-foreground hover:text-sage transition-colors underline underline-offset-4 tracking-wide"
            >
              AM Enterprises
            </a>
          </p>
        </div>
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

export function CurrencySelector({ className = "" }: { className?: string }) {
  const [currency, setCurrency] = useCurrency();
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        aria-label="Select currency"
        className="appearance-none rounded-full border border-border/80 bg-secondary/80 py-1.5 pl-2.5 pr-6 text-[11px] font-bold uppercase tracking-wider text-foreground hover:bg-secondary focus-veloura cursor-pointer"
      >
        {Object.values(CURRENCIES).map((c) => (
          <option key={c.code} value={c.code} className="bg-background text-foreground text-xs py-1">
            {c.flag} {c.code} ({c.symbol})
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeDepartment = useRouterState({ select: state => state.location.search['department'] });
  const home = pathname === '/';
  useEffect(() => { const update = () => setScrolled(window.scrollY > 48); update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  useEffect(() => setMobileOpen(false), [pathname]);
  const { openSearch, openCart, cartCount, wishlist } = useVelouraStore();
  const { data: settingsData } = useSettings();
  const navItems = [
    ...SHOP_DEPARTMENTS.map(department => ({ label: department, to: '/shop' as const, search: { department }, icon: department === 'Mens' ? Home : ShoppingBag })),
    { label: 'Orders', to: '/track' as const, icon: PackageCheck },
    { label: 'Wishlist', to: '/wishlist' as const, icon: Heart },
    { label: 'Account', to: '/account' as const, icon: UserRound },
  ];
  return <header className={`store-header relative z-40 ${home ? 'header-home' : 'header-page'} ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="announcement bg-primary px-4 py-2 text-center text-primary-foreground font-semibold tracking-wider text-[11px] uppercase">
      {settingsData?.settings?.brand_tagline ?? storeConfig.announcement}
    </div>
    <nav aria-label="Main navigation" className="nav-shell">
      {/* ─── DESKTOP VIEW (xl: Left Logo, Center Nav Links, Right Actions) ─── */}
      <div className="hidden xl:flex items-center justify-between w-full gap-4">
        {/* Left: Brand Logo */}
        <Link to="/" aria-label="VELOURA home" className="nav-logo focus-veloura shrink-0 flex items-center justify-start">
          <Logo />
        </Link>

        {/* Center: Navigation Links */}
        <div className="flex items-center justify-center gap-1.5 mx-auto">
          {navItems.map(item => (
            <Link key={item.label} to={item.to} search={'search' in item ? item.search : {}} aria-current={pathname === '/shop' && activeDepartment === item.label ? 'page' : undefined} className="nav-item-link inline-flex items-center gap-1.5">
              <span>{item.label}</span>
              {item.label === 'Wishlist' && wishlist.length > 0 && (
                <span className="ml-0.5 grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="nav-actions flex shrink-0 items-center justify-end gap-1.5">
          <CurrencySelector className="mr-1" />
          <Button variant="ghost" size="icon" onClick={openSearch} aria-label="Search VELOURA" className="nav-icon-btn">
            <Search className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={openCart} aria-label={`Open cart, ${cartCount} items`} className="relative nav-icon-btn">
            <ShoppingBag className="size-4" />
            {cartCount ? <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold">{cartCount}</span> : null}
          </Button>
        </div>
      </div>

      {/* ─── MOBILE VIEW (< xl: Left Menu + Search, Center Logo, Right MapPin + Cart) ─── */}
      <div className="flex xl:hidden items-center justify-between w-full h-full gap-2">
        {/* Left: Menu button + Search button */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="menu-toggle nav-icon-btn size-10"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={openSearch}
            aria-label="Search VELOURA"
            className="nav-icon-btn size-10"
          >
            <Search className="size-5" />
          </Button>
        </div>

        {/* Center: Big Prominent Logo */}
        <Link to="/" aria-label="VELOURA home" className="nav-logo focus-veloura flex items-center justify-center py-1 flex-1 min-w-0 text-center">
          <Logo className="text-[28px] sm:text-[34px] tracking-[0.22em]" />
        </Link>

        {/* Right: MapPin (Location/Track) + Cart */}
        <div className="flex items-center justify-end gap-0.5 shrink-0">
          <Button asChild variant="ghost" size="icon" className="nav-icon-btn size-10" aria-label="Track order and location">
            <Link to="/track">
              <MapPin className="size-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={openCart}
            aria-label={`Open cart, ${cartCount} items`}
            className="relative nav-icon-btn size-10"
          >
            <ShoppingBag className="size-5" />
            {cartCount ? (
              <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold">
                {cartCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>
    </nav>
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="right" className="w-[85vw] max-w-[340px] p-0 flex flex-col justify-between bg-background border-l border-border z-50">
        <SheetTitle className="sr-only">VELOURA menu</SheetTitle>
        <div className="flex flex-col h-full overflow-y-auto p-6">
          <div className="flex items-center justify-center pb-4 border-b border-border">
            <Logo />
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Currency & Region</p>
            <CurrencySelector className="w-full" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => { setMobileOpen(false); openSearch(); }} className="gap-2">
              <Search className="size-4" /> Search
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setMobileOpen(false); openCart(); }} className="gap-2">
              <ShoppingBag className="size-4" /> Bag ({cartCount})
            </Button>
          </div>

          <div className="mt-5 flex flex-col divide-y divide-border/60">
            {navItems.map(item => { const { label, to, icon: Icon } = item; return (
              <Link
                key={label}
                to={to}
                search={'search' in item ? item.search : {}}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-3 rounded-lg text-[15px] font-bold tracking-wide sheet-nav-link transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{label}</span>
                </span>
                {label === 'Wishlist' && wishlist.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            ); })}
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="py-3 px-3 rounded-lg text-[15px] font-bold sheet-nav-link transition-all">
              Contact Concierge
            </Link>
          </div>

          <div className="mt-auto pt-6 border-t border-border/60 text-xs text-muted-foreground flex flex-col gap-1.5">
            <p className="font-semibold text-foreground">VELOURA APPAREL</p>
            <p className="text-[11px]">Modern Men's Luxury & Couture</p>
            <a href="https://wa.me/923173712950" target="_blank" rel="noreferrer" className="text-sage font-semibold flex items-center gap-1.5 mt-1">
              💬 WhatsApp Concierge
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </header>;
}

export function HomePage() {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.map(fromBackend) ?? [];
  const newArrivalItems = liveProducts.filter(p => p.newArrival).slice(0, 8);
  const bestSellerItems = liveProducts.filter(p => p.bestSeller || p.featured).slice(0, 8);
  const budgetItems     = liveProducts.filter(p => p.price < 5000).slice(0, 4);
  return (
    <main>
      <HeroCarousel />
      <TrustStrip />
      <CategorySection liveProducts={liveProducts} />
      {newArrivalItems.length > 0 && <NewArrivalsShelf products={newArrivalItems} />}
      <SaleBanner />
      {bestSellerItems.length > 0 && <BestSellersShelf products={bestSellerItems} newItems={newArrivalItems} />}
      <FeaturedCampaignJackets />
      <DealsShowcase />
      <CollectionsStrip />
      {budgetItems.length > 0 && <BudgetSection products={budgetItems} />}
      <MensOutfitsSection />
      <BrandStorySection />
      <JournalPreview />
      <HomeDeals />
      <ShoppingConfidence />
      <BuildYourLook liveProducts={liveProducts} />
      <NewsletterBand />
    </main>
  );
}
function TrustStrip() {
  const { data } = useSettings();
  const freeAbove = data?.payment?.free_delivery_above ?? storeConfig.freeShippingThreshold;
  const items: [React.ElementType, string, string][] = [
    [Truck,       "Free delivery",     `From ${formatPrice(freeAbove)} on all orders`],
    [RotateCcw,   "Size guides",       "Measurements on every product"],
    [ShieldCheck, "Cash on Delivery",  "Available nationwide"],
    [Sparkles,    "Exclusive offers",  "Members get first access"],
  ];
  return (
    <section aria-label="Shopping benefits" className="border-y border-border bg-secondary overflow-hidden">
      {/* Desktop Divided Bar */}
      <div className="hidden md:flex mx-auto max-w-[1400px] divide-x divide-border">
        {items.map(([Icon, label, sub]) => (
          <div key={label} className="flex flex-1 items-center gap-3 px-6 py-4">
            <Icon className="size-5 shrink-0 text-sage" />
            <div>
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Continuous Marquee */}
      <div className="flex md:hidden marquee-container py-3 bg-secondary">
        <div className="marquee-track flex items-center">
          {[...items, ...items, ...items].map(([Icon, label, sub], idx) => (
            <div key={`${label}-${idx}`} className="flex shrink-0 items-center gap-2.5 px-5">
              <Icon className="size-4 shrink-0 text-sage" />
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-xs font-bold text-foreground">{label}:</span>
                <span className="text-[11px] text-muted-foreground">{sub}</span>
              </div>
              <span className="ml-4 text-border font-light select-none">|</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StorefrontPopup() {
  const { data } = usePopups();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popup = data?.popups?.find((p) => p.active !== false);

  useEffect(() => {
    if (!popup) return;
    const key = `va_popup_dismissed_${popup.id}`;
    if (sessionStorage.getItem(key)) return;

    const delay = (popup.delay_seconds ?? 3) * 1000;
    const timer = setTimeout(() => {
      setOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [popup]);

  if (!popup || !open) return null;

  const handleDismiss = () => {
    if (popup) sessionStorage.setItem(`va_popup_dismissed_${popup.id}`, "1");
    setOpen(false);
  };

  const copyCoupon = () => {
    if (popup.coupon_code) {
      navigator.clipboard.writeText(popup.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleDismiss(); }}>
      <DialogContent className="max-w-[460px] p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-card">
        <DialogTitle className="sr-only">{popup.title || "Special Offer"}</DialogTitle>
        <div className="relative p-6 sm:p-8 text-center flex flex-col items-center">
          <button
            onClick={handleDismiss}
            aria-label="Close offer"
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>

          {popup.badge && (
            <span className="inline-block px-3 py-1 mb-3 text-[10px] font-bold tracking-widest uppercase rounded-full bg-primary/10 text-primary">
              {popup.badge}
            </span>
          )}

          <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {popup.title || "Enjoy 10% Off Your First Order"}
          </h3>

          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {popup.message || "Use code WELCOME10 at checkout to save on all premium apparel."}
          </p>

          {popup.coupon_code && (
            <div className="mt-5 w-full bg-secondary/80 border border-dashed border-border rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="text-left">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground">PROMO CODE</span>
                <span className="text-base font-extrabold tracking-widest font-mono text-foreground">{popup.coupon_code}</span>
              </div>
              <Button size="sm" variant="outline" onClick={copyCoupon} className="font-semibold text-xs h-8">
                {copied ? <><Check className="size-3.5 mr-1 text-emerald-600" /> Copied!</> : "Copy Code"}
              </Button>
            </div>
          )}

          <div className="mt-6 w-full flex flex-col gap-2">
            <Button
              asChild
              className="w-full h-11 font-bold text-sm tracking-wide"
              onClick={handleDismiss}
            >
              <Link to={popup.cta_href || "/collections"}>
                {popup.cta_label || "Explore Collection"}
              </Link>
            </Button>
            <button
              onClick={handleDismiss}
              className="mt-1 text-xs text-muted-foreground hover:text-foreground transition underline-offset-4 hover:underline"
            >
              No thanks, continue browsing
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-[4/5] rounded bg-secondary" />
    <div className="mt-3 h-4 w-3/4 rounded bg-secondary" />
    <div className="mt-2 h-3 w-1/2 rounded bg-secondary" />
  </div>
);

function NewArrivalsShelf({ products: shelfProducts }: { products: Product[] }) {
  return (
    <section className="store-section">
      <SectionHeader
        label="THE EVERYDAY LINEUP"
        title="Men's Essentials. Sorted."
        action={<LinkText to="/new-arrivals">Shop all new arrivals →</LinkText>}
      />
      <p className="mb-7 max-w-lg text-sm leading-6 text-muted-foreground">
        Start with a clean tee, add an easy layer, finish with your favourite trousers.
      </p>
      {shelfProducts.length === 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <ProductGrid products={shelfProducts} />
      )}
    </section>
  );
}

function BestSellersShelf({
  products: shelfProducts,
  newItems,
}: {
  products: Product[];
  newItems: Product[];
}) {
  const [tab, setTab] = useState<"best" | "new">("best");
  const displayed = tab === "best" ? shelfProducts : newItems;
  return (
    <section className="store-section bg-secondary -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
      <SectionHeader
        label="THE SIGNATURE EDIT"
        title="Pieces Worth Coming Back To."
      />
      {/* Tab switcher */}
      <div className="mb-7 flex gap-6 border-b border-border">
        {(["best", "new"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors focus-veloura
              ${tab === t
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "best" ? "Best Sellers" : "New In"}
          </button>
        ))}
      </div>
      {displayed.length === 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <ProductGrid products={displayed} />
      )}
    </section>
  );
}

function FeaturedCampaignJackets() {
  return (
    <section className="store-section bg-primary text-primary-foreground -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-xl">
          <img
            src={campaignImages.one}
            alt="VEL0URA APPAREL jacket campaign"
            width={900}
            height={1100}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        {/* Text */}
        <div>
          <p className="editorial-label text-primary-foreground/70">BUILT FOR YOUR EVERYDAY</p>
          <h2 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">
            The Jacket Edit.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-primary-foreground/80">
            Layers made for every season. Refined silhouettes designed to work
            with the rest of your wardrobe.
          </p>
          <Button asChild variant="secondary" className="mt-8">
            <Link to="/shop" search={{ category: "Jackets" } as never}>
              Shop Jackets <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


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
  const firstCoupon = liveCoupons[0] ?? null;
  const [selected, setSelected] = useState(false);
  // Only render when there is a real coupon from the database
  if (!firstCoupon) return null;
  const code = firstCoupon.code;
  const desc = firstCoupon.description ?? `Use ${code} on your next bag. One code per order.`;
  const discVal = firstCoupon.discount_value;
  const headline = firstCoupon.discount_type === 'percent' ? `Make it yours. Save ${discVal}%.` : `Make it yours. Save ${formatPrice(discVal)} off.`;
  return <section className="home-deals border-b border-border bg-secondary"><div className="store-section grid gap-8 md:grid-cols-[1fr_1fr]"><div><p className="editorial-label">YOUR FIRST LOOK</p><h2 className="mt-3 font-display text-4xl">{headline}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{desc}</p><Button variant="outline" className="mt-5" onClick={()=>{ void applyCoupon(code).then(ok=>{ if(ok) setSelected(true); }); }}>{selected ? <Check /> : <Plus />}{selected ? `${code} applied` : `Apply ${code}`}</Button><p className="sr-only" role="status">{selected ? `${discVal}${firstCoupon.discount_type === 'percent' ? '%' : ''} discount applied to your bag.` : ''}</p></div><div className="border-t border-border pt-7 md:border-l md:border-t-0 md:pl-9 md:pt-0"><p className="editorial-label">EASY ON THE BUDGET</p><h2 className="mt-3 font-display text-4xl">Essentials under Rs. 5,000.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Everyday tees and finishing touches, without the extra spend.</p><Button asChild className="mt-5"><Link to="/shop" search={{category:'T-Shirts'}}>Shop everyday tees <ArrowRight /></Link></Button></div></div></section>;
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

// ── REBUILT: Deals Showcase — spec-compliant visual deal cards grid ──────────
function DealsShowcase() {
  const { data: dealsData } = useDeals();
  const deals = (dealsData?.deals ?? []).filter(d => d.title);
  if (!deals.length) return null;

  return (
    <section className="store-section">
      <SectionHeader
        label="SELECTED STYLES"
        title="Great Fits. Better Prices."
        action={<LinkText to="/sale">All deals</LinkText>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deals.slice(0, 3).map(deal => (
          <Link
            key={deal.id}
            to={(deal.cta_href ?? "/sale") as "/sale"}
            className="group relative overflow-hidden rounded-[18px] bg-primary focus-veloura"
            style={{ minHeight: 280 }}
          >
            {deal.image_url && (
              <img
                src={assetUrl(deal.image_url)}
                alt={deal.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="hero-shade absolute inset-0" />
            <div className="relative flex h-full flex-col justify-end p-6 text-primary-foreground">
              {deal.badge && (
                <span className="mb-2 inline-flex w-fit items-center rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                  {deal.badge}
                </span>
              )}
              <h3 className="font-display text-2xl leading-tight">{deal.title}</h3>
              {deal.subtitle && (
                <p className="mt-1 text-sm text-primary-foreground/80">{deal.subtitle}</p>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 w-fit"
                asChild
              >
                <span className="inline-flex items-center gap-1">
                  {deal.cta_label ?? "Shop now"} <ArrowRight className="size-4" />
                </span>
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── REBUILT: Collections Strip — spec-compliant horizontal scroll ────────────
function CollectionsStrip() {
  const { data: collectionsData } = useCollections();
  const collections = (collectionsData?.collections ?? []).filter(c => c.active !== false);
  if (!collections.length) return null;

  return (
    <section className="store-section overflow-hidden">
      <SectionHeader
        label="CURATED FOR YOU"
        title="Explore the Collections."
        action={<LinkText to="/collections">All collections</LinkText>}
      />
      <div
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {collections.map(col => (
          <Link
            key={col.id}
            to="/collections"
            search={{ collection: col.slug } as never}
            className="group relative shrink-0 snap-start overflow-hidden rounded-2xl focus-veloura"
            style={{ width: "clamp(220px, 28vw, 260px)", aspectRatio: "3/4" }}
          >
            {col.image_url ? (
              <img
                src={assetUrl(col.image_url)}
                alt={col.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-secondary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <p className="font-display text-xl font-semibold leading-tight">{col.name}</p>
              {col.tagline && (
                <p className="mt-1 text-xs text-white/70">{col.tagline}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BudgetSection({ products: budgetProducts }: { products: Product[] }) {
  if (!budgetProducts.length) return null;
  return (
    <section className="store-section bg-secondary -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
      <SectionHeader
        label="EASY ON THE BUDGET"
        title="Everyday Essentials Under Rs. 5,000."
        action={<LinkText to="/shop">Shop Essentials</LinkText>}
      />
      <ProductGrid products={budgetProducts} />
    </section>
  );
}

function MensOutfitsSection() {
  const { data: catData } = useCategories();
  const allCats = catData?.categories ?? [];

  const TILES = [
    { name: "Men's Outfits",     slug: "mens-outfits",     category: "mens-outfits",     fallbackImg: campaignImages.two,   gradient: "from-stone-900/80 to-zinc-800/80" },
    { name: "Leather Jackets",   slug: "leather-jackets",   category: "leather-jackets",   fallbackImg: campaignImages.one,   gradient: "from-amber-950/80 to-stone-900/80" },
    { name: "Shirts & Trousers", slug: "shirts",            category: "shirts",            fallbackImg: campaignImages.three, gradient: "from-zinc-900/80 to-slate-800/80" },
  ];

  return (
    <section className="store-section">
      <SectionHeader
        label="COMPLETE THE LOOK"
        title="Men's Outfits & Signature Layers."
      />
      <p className="mb-7 max-w-lg text-sm leading-6 text-muted-foreground">
        Contemporary silhouettes, genuine leather jackets, and coordinated sets designed for confident modern style.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {TILES.map(tile => {
          const cat = allCats.find(c => c.slug === tile.slug || c.name === tile.name);
          const img = cat?.image_url ? assetUrl(cat.image_url) : tile.fallbackImg;
          return (
            <Link
              key={tile.slug}
              to="/collections"
              search={{ category: tile.category } as never}
              className="group relative overflow-hidden rounded-xl focus-veloura"
              style={{ minHeight: 320 }}
            >
              {img ? (
                <img
                  src={img}
                  alt={tile.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${tile.gradient}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="font-display text-2xl font-semibold">{tile.name}</p>
                <p className="mt-1 text-sm text-white/70">Discover the edit →</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function BrandStorySection() {
  return (
    <section className="store-section -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
      <div
        className="mx-auto grid max-w-[1400px] overflow-hidden rounded-xl
          lg:grid-cols-2"
      >
        {/* Image side */}
        <div className="relative min-h-[400px] overflow-hidden lg:min-h-[560px]">
          <img
            src={campaignImages.two}
            alt="VEL0URA APPAREL brand story"
            width={900}
            height={1100}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        {/* Text side — charcoal bg */}
        <div className="flex flex-col justify-center bg-primary px-8 py-12 text-primary-foreground lg:px-14">
          <p className="editorial-label text-primary-foreground/70">OUR APPROACH</p>
          <h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">
            Less Noise.<br />More Character.
          </h2>
          <p className="mt-6 max-w-md leading-7 text-primary-foreground/80">
            VEL0URA APPAREL brings together modern silhouettes, versatile essentials,
            and considered details for a wardrobe that feels personal, confident,
            and timeless.
          </p>
          <Button asChild variant="secondary" className="mt-8 w-fit">
            <Link to="/about">Discover Our Story <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    </section>
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
 const slides = heroData?.slides?.length
   ? heroData.slides.map(s => ({
       label: s.eyebrow ?? '',
       headline: s.title ?? '',
       text: s.description ?? '',
       cta: s.cta_label ?? 'Shop now',
       ctaPath: (s.cta_href ?? '/shop') as '/shop' | '/collections' | '/new-arrivals',
       image: s.image_url ? assetUrl(s.image_url) : '',
       product: s.title ?? '',
       badge: null as string | null,
     }))
   : [];
 const slide = slides[index] ?? slides[0];
 useEffect(()=>{if(paused || prefersReducedMotion())return;const timer=window.setInterval(()=>setIndex(i=>(i+1)%slides.length),6500);return()=>window.clearInterval(timer);},[paused, slides.length]);
 const go=(direction:number)=>setIndex(i=>(i+direction+slides.length)%slides.length);
 if (apiEnabled && !slides.length) return <div className='veloura-hero relative overflow-hidden bg-primary animate-pulse' style={{minHeight:'70vh'}} aria-hidden='true' />;
 if(!slide)return null;
 return <section id="hero" aria-roledescription="carousel" aria-label="VEL0URA APPAREL campaign" className="veloura-hero relative overflow-hidden bg-primary" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onTouchStart={e=>{touchStart.current=e.touches[0]?.clientX??null;}} onTouchEnd={e=>{const start=touchStart.current;if(start===null)return;const end=e.changedTouches[0]?.clientX??start;if(start-end>40)go(1);if(end-start>40)go(-1);touchStart.current=null;}}>
 {slides.map((hero,i)=><img key={hero.headline || i} src={hero.image} alt={i===index ? `${hero.product ?? ''} seasonal campaign` : ""} aria-hidden={i!==index} width={1600} height={1200} loading={i===0?'eager':'lazy'} fetchPriority={i===0?'high':'auto'} className={`hero-image absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i===index?'opacity-100':'opacity-0'}`} />)}
 <div className="hero-shade absolute inset-0" />
 <div className="hero-inner relative z-10 mx-auto flex h-full max-w-[1500px] flex-col justify-end text-primary-foreground">
 <div key={index} className="hero-stagger hero-copy">
  <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/90">{slide.label.toUpperCase()}</p>
  <h1 className="hero-title mt-4 font-display uppercase tracking-tight text-white font-extrabold leading-[0.92]">VELOURA<br />APPAREL</h1>
  <p className="mt-4 text-sm sm:text-base font-bold uppercase tracking-[0.16em] text-white/95">{slide.headline.toUpperCase()}</p>
  <p className="mt-3 max-w-lg text-sm sm:text-base font-medium leading-relaxed text-white/85">{slide.text}</p>
  <div className="mt-6 flex flex-wrap gap-3">
    <Button asChild size="lg" className="bg-white text-black font-bold uppercase tracking-wider text-xs px-7 py-3.5 hover:bg-neutral-200 transition-colors shadow-lg">
      <Link to={slide.ctaPath}>{slide.cta.toUpperCase()}<ArrowRight className="size-4 ml-1.5" /></Link>
    </Button>
    <Button asChild variant="outline" size="lg" className="border-2 border-white/80 text-white font-bold uppercase tracking-wider text-xs px-7 py-3.5 hover:bg-white hover:text-black transition-colors">
      <Link to="/collections">THE COLLECTION</Link>
    </Button>
  </div>
  {slide.badge ? <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/80">{slide.badge.toUpperCase()}</p> : null}
 </div>
 <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-primary-foreground/30 pt-4"><div className="flex items-center gap-3"><span className="text-xs">{String(index+1).padStart(2,"0")} / {String(slides.length).padStart(2,"0")}</span>{slides.map((h,i)=><Button key={h.headline || i} variant="ghost" size="icon" className="size-7 hover:bg-primary/20" aria-label={`Go to slide ${i+1}`} aria-current={i===index} onClick={()=>setIndex(i)}><span className={`block h-0.5 w-5 ${i===index?'bg-primary-foreground':'bg-primary-foreground/40'}`} /></Button>)}</div><div className="flex"><Button variant="ghost" size="icon" className="text-primary-foreground" aria-label={paused?'Play hero slides':'Pause hero slides'} onClick={()=>setPaused(v=>!v)}>{paused?<Play />:<Pause />}</Button><Button variant="ghost" size="icon" className="text-primary-foreground" onClick={()=>go(-1)} aria-label="Previous hero slide"><ArrowLeft /></Button><Button variant="ghost" size="icon" className="text-primary-foreground" onClick={()=>go(1)} aria-label="Next hero slide"><ArrowRight /></Button></div></div>
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

function LinkText({ to, children }: { to: "/shop" | "/journal" | "/about" | "/collections" | "/new-arrivals" | "/best-sellers" | "/sale"; children: React.ReactNode }) {
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
  const { toggleWishlist, isWishlisted } = useVelouraStore();
  const wished = isWishlisted(product.id);
  const [quickOpen,setQuickOpen]=useState(false);
  return (
    <article className="group relative">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="focus-veloura block">
        <Tilt max={5}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted shadow-sm">
          <img src={product.images[0] ?? ""} alt={product.name} width={900} height={1125} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
          {product.images[1] ? <img src={product.images[1]} alt={`${product.name} alternate view`} width={900} height={1125} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" /> : null}
          <div className="absolute left-2 top-2 flex max-w-[65%] flex-col items-start gap-1">
            {product.newArrival ? <Badge>NEW</Badge> : null}
            {product.bestSeller ? <Badge>BESTSELLER</Badge> : null}
            {product.stock < 8 ? <Badge>LOW STOCK</Badge> : null}
            {product.salePrice && product.price > 0 && (
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[0.6rem] font-bold text-white">
                {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
              </span>
            )}
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
      <Button variant="outline" size="sm" className="mt-4 w-full md:opacity-0 md:group-hover:opacity-100 md:transition-opacity" onClick={()=>setQuickOpen(true)}>Quick Add <Plus /></Button>
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

const FALLBACK_CATS = [
  { id: "f1", name: "Jackets",     slug: "Jackets",     image_url: campaignImages.one   },
  { id: "f2", name: "T-Shirts",    slug: "T-Shirts",    image_url: campaignImages.two   },
  { id: "f3", name: "Shirts",      slug: "Shirts",      image_url: campaignImages.three },
  { id: "f4", name: "Men's Outfits", slug: "Men's Outfits", image_url: campaignImages.two },
  { id: "f5", name: "Accessories", slug: "Accessories", image_url: bannerAccessories    },
  { id: "f6", name: "Fragrance",   slug: "Fragrance",   image_url: campaignImages.one   },
] as const;

function CategorySection({ liveProducts: _liveProducts }: { liveProducts: Product[] }) {
  const { data: catData, isLoading } = useCategories();
  const dbCats = (catData?.categories ?? []).filter(c => (c as { active?: boolean }).active !== false);
  const cats = dbCats.length ? dbCats : FALLBACK_CATS;

  return (
    <section className="store-section">
      <SectionHeader
        label="DISCOVER YOUR STYLE"
        title="Find Your Kind of Fit."
      />
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse aspect-[3/4] rounded-lg bg-secondary" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 auto-rows-[220px]">
          {cats.slice(0, 6).map((cat, i) => {
            const img = typeof cat.image_url === "string"
              ? (cat.image_url.startsWith("/") ? assetUrl(cat.image_url) : cat.image_url)
              : "";
            return (
              <Link
                key={cat.id}
                to="/collections"
                search={{ category: cat.slug } as never}
                className={`group relative overflow-hidden rounded-xl focus-veloura
                  ${i === 0 ? "row-span-2" : ""}`}
              >
                {img && (
                  <img
                    src={img}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-display text-xl font-semibold leading-tight">{cat.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
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
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.map(fromBackend) ?? [];
  const featured = liveProducts.filter((product) => product.featured).slice(0, 4);
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
  const liveProducts = propProducts ?? (productsData?.products?.map(fromBackend) ?? []);
  const [selectedId, setSelectedId] = useState(liveProducts[0]?.id ?? "");
  const { addManyToCart } = useVelouraStore();
  const selected = liveProducts.find((product) => product.id === selectedId) ?? liveProducts[0];
  if (!selected) return null;
  // Recommend from live products — same-category or same-mood, different id
  const recommendations = liveProducts
    .filter(p => p.id !== selected.id && (p.category === selected.category || p.mood === selected.mood))
    .slice(0, 4);
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
    ? data.posts.map(p => ({
        slug: p.slug,
        title: p.title,
        description: p.excerpt ?? "",
        image: p.image_url ? assetUrl(p.image_url) : campaignImages.one,
        category: p.category ?? "Journal",
      }))
    : articles.slice(0, 3);

  if (!liveArticles.length) return null;

  return (
    <section className="store-section">
      <SectionHeader
        label="THE VEL0URA JOURNAL"
        title="Notes on Modern Dressing."
        action={<LinkText to="/journal">Read journal</LinkText>}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {liveArticles.slice(0, 3).map(article => (
          <article key={article.slug} className="group">
            <Link
              to="/journal/$slug"
              params={{ slug: article.slug }}
              className="focus-veloura block"
            >
              <div className="aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                <img
                  src={article.image}
                  alt={article.title}
                  width={900}
                  height={506}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                />
              </div>
              <div className="mt-4">
                <span className="editorial-label inline-block rounded-full bg-secondary px-3 py-1">
                  {article.category}
                </span>
                <h3 className="mt-3 font-display text-2xl leading-tight">{article.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {article.description}
                </p>
                <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.18em] underline underline-offset-4">
                  Read Article →
                </span>
              </div>
            </Link>
          </article>
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
    <section className="bg-primary text-primary-foreground px-5 py-20 sm:px-8 lg:px-12">
      <form
        className="mx-auto max-w-4xl text-center"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim()) setSuccess(true);
        }}
      >
        <p className="editorial-label text-primary-foreground/70">Newsletter</p>
        <h2 className="mt-4 font-display text-5xl leading-none text-primary-foreground sm:text-7xl">JOIN THE VELOURA LIST</h2>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-primary-foreground/70">Get first access to new collections, exclusive drops and stories from VEL0URA APPAREL.</p>
        <div className="mx-auto mt-8 flex max-w-xl gap-2 border-b border-primary-foreground/30 pb-2">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="min-w-0 flex-1 bg-transparent text-center outline-hidden placeholder:text-muted-foreground focus-veloura sm:text-left" />
          <Button type="submit" variant="secondary" size="sm">
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
  const liveProducts = productsData?.products?.map(fromBackend) ?? [];
  const routerState = useRouterState();
  const searchParams = (routerState.location.search || {}) as Record<string, string | undefined>;
  const department = normalizeAudience(searchParams['department']);
  const activeUrlCat = searchParams['category'] || initialCategory;
  const [query, setQuery] = useState(searchParams['q'] || "");
  const [category, setCategory] = useState(activeUrlCat);
  useEffect(() => {
    if (searchParams['category']) setCategory(searchParams['category']);
    else setCategory(initialCategory);
    setQuery(searchParams['q'] || "");
    setLimit(12);
    setSize("All");
    setColor("All");
    setPrice("All");
    setAvailability("All");
  }, [searchParams['category'], searchParams['department'], searchParams['q'], initialCategory]);
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
      const normCat = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchesCategory =
        category === "All" ||
        product.category === category ||
        (normalizeAudience(category) != null && normalizeAudience(product.audience) === normalizeAudience(category)) ||
        normCat(product.category) === normCat(category) ||
        (normCat(category).includes("leather") && normCat(product.category).includes("leather")) ||
        (category === "New Arrivals" && product.newArrival) ||
        (category === "Sale" && Boolean(product.salePrice));
      const matchesMode = mode === "all" || mode === "new" && product.newArrival || mode === "best" && product.bestSeller || mode === "sale" && Boolean(product.salePrice);
      const matchesSize = size === "All" || product.sizes.includes(size);
      const matchesColor = color === "All" || product.colors.includes(color);
      const matchesPrice = price === "All" || (price === "Under Rs. 4,000" ? productPrice(product) < 4000 : price === "Rs. 4,000–8,000" ? productPrice(product) >= 4000 && productPrice(product) <= 8000 : productPrice(product) > 8000);
      const matchesAvailability = availability === "All" || (availability === "In Stock" ? product.stock > 0 : product.stock > 0 && product.stock < 8);
      const matchesAudience = !department || matchesDepartment(product.audience, department);
      return matchesAudience && matchesMode && matchesQuery && matchesCategory && matchesSize && matchesColor && matchesPrice && matchesAvailability;
    });
    if (sort === "Newest") list = [...list].sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    if (sort === "Price: Low to High") list = [...list].sort((a, b) => productPrice(a) - productPrice(b));
    if (sort === "Price: High to Low") list = [...list].sort((a, b) => productPrice(b) - productPrice(a));
    if (sort === "Featured") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    if (sort === "Best Rated") list = [...list].sort((a,b)=>b.rating-a.rating);
    if (sort === "Best Selling") list = [...list].sort((a,b)=>b.reviewCount-a.reviewCount);
    return list;
  }, [liveProducts, department, query, category, size, color, price, availability, sort, mode]);

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
          <h1 className="mt-3 font-display text-6xl leading-none sm:text-8xl">{department ? department.toUpperCase() : mode === "new" ? "NEW ARRIVALS" : mode === "best" ? "BEST SELLERS" : mode === "sale" ? "THE SALE EDIT" : "SHOP VEL0URA APPAREL"}</h1>
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
      <FilterSelect label="Category" value={props.category} onChange={props.setCategory} options={["All", "Sale", "New Arrivals", ...categories]} />
      <FilterSelect label="Size" value={props.size} onChange={props.setSize} options={["All", ...sizes, "36", "37", "38", "39", "40", "41", "42", "43", "44", "ONE SIZE"]} />
      <FilterSelect label="Color" value={props.color} onChange={props.setColor} options={["All", ...colors]} />
      <FilterSelect label="Price" value={props.price} onChange={props.setPrice} options={["All", "Under Rs. 4,000", "Rs. 4,000–8,000", "Over Rs. 8,000"]} />
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

function StylistConcierge({ product, selectedSize, selectedColor }: { product: Product; selectedSize: string; selectedColor: string }) {
  const { data: settingsData } = useSettings();
  const phone = settingsData?.settings?.whatsapp_number || "923000000000";
  const cleanPhone = phone.replace(/[^0-9]/g, "");

  const msg = encodeURIComponent(
    `Hello Veloura Styling Concierge, I am viewing the ${product.name} (${formatPrice(productPrice(product))}) in Color: ${selectedColor}, Size: ${selectedSize}. Could you advise on tailoring fit, outfit pairing, and delivery?`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${msg}`;

  return (
    <div className="mt-4 rounded-xl border border-border/80 bg-secondary/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sage">
            <span className="size-1.5 rounded-full bg-sage animate-pulse" />
            VIP Styling Concierge
          </span>
          <p className="mt-1 font-display text-base font-semibold">Need Personalized Styling or Fit Advice?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Our menswear stylists are available on WhatsApp for direct bespoke sizing, leather jacket care, and complete outfit coordination.
          </p>
        </div>
      </div>
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
      >
        💬 Chat with Stylist on WhatsApp
      </a>
    </div>
  );
}

function RestockAlertModal({ product, selectedSize }: { product: Product; selectedSize: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [chosenSize, setChosenSize] = useState(selectedSize);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChosenSize(selectedSize);
  }, [selectedSize]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    await api.trackLead({
      ...(name.trim() ? { name: name.trim() } : {}),
      phone: phone.trim(),
      stage: "waitlist",
      notes: `Restock alert requested for ${product.name} (Size: ${chosenSize})`,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2.5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition flex items-center gap-1.5"
      >
        🔔 Don't see your size? Get VIP Restock Alert
      </button>

      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md p-6">
            <DialogTitle className="font-display text-2xl font-bold">
              VIP Restock & Size Notification
            </DialogTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              We produce in limited handcrafted batches. Enter your details to get first priority alert on WhatsApp when this size returns.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-xl bg-secondary p-5 text-center">
                <Check className="size-8 text-sage mx-auto mb-2" />
                <p className="font-display text-lg font-bold">You're on the Priority List</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We'll message you at <strong>{phone}</strong> the moment {product.name} (Size {chosenSize}) is restocked.
                </p>
                <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="mt-4">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Select Desired Size
                  </label>
                  <select
                    value={chosenSize}
                    onChange={(e) => setChosenSize(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold focus-veloura"
                  >
                    {product.sizes.map((s) => (
                      <option key={s} value={s}>
                        Size {s}
                      </option>
                    ))}
                    <option value="Custom Bespoke Measurement">Custom Bespoke Measurement</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ali Khan"
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs focus-veloura"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs focus-veloura"
                  />
                </div>

                <Button type="submit" variant="editorial" disabled={loading} className="w-full mt-2">
                  {loading ? "Joining Waitlist..." : "Notify Me on WhatsApp"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function SaveBagToWhatsApp({ cart, liveProducts, cartTotal }: { cart: CartItem[]; liveProducts: Product[]; cartTotal: number }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: settingsData } = useSettings();
  const supportPhone = settingsData?.settings?.whatsapp_number || "923000000000";
  const cleanSupport = supportPhone.replace(/[^0-9]/g, "");

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setSaving(true);

    // Save lead into database!
    await api.trackLead({
      ...(name.trim() ? { name: name.trim() } : {}),
      phone: phone.trim(),
      stage: "cart",
      items: cart,
      item_count: cart.length,
      cart_value: cartTotal,
      currency: getActiveCurrency(),
      notes: "Customer used Save Bag to WhatsApp",
    });

    setSaving(false);
    setOpen(false);

    // Generate WhatsApp text
    const lines = cart.map((it) => {
      const p = liveProducts.find((x) => x.id === it.productId);
      return `• ${p?.name || "Item"} (Size: ${it.size}, Color: ${it.color}) x ${it.quantity}`;
    });

    const text = encodeURIComponent(
      `Hello Veloura, I am saving my bag:\n\n${lines.join("\n")}\n\nTotal: ${formatPrice(cartTotal)}\nName: ${name || "Guest"}\nWhatsApp: ${phone}\n\nPlease reserve these items for me.`
    );
    window.open(`https://wa.me/${cleanSupport}?text=${text}`, "_blank");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600/40 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 transition cursor-pointer"
      >
        💬 Save Bag to WhatsApp & Reserve Look
      </button>

      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md p-6">
            <DialogTitle className="font-display text-2xl font-bold">
              Save Bag & Send to WhatsApp
            </DialogTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter your mobile number. We will save your bag, reserve your sizes in our system, and text your look directly to your WhatsApp.
            </p>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Usman Malik"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs focus-veloura"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs focus-veloura"
                />
              </div>

              <div className="rounded-lg bg-secondary/70 p-3 text-xs text-muted-foreground">
                📦 {cart.length} items reserved in your bag ({formatPrice(cartTotal)})
              </div>

              <Button type="submit" variant="editorial" disabled={saving} className="w-full mt-2">
                {saving ? "Saving Bag..." : "Save & Open WhatsApp"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function ProductDetailPage({ product }: { product: Product }) {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.map(fromBackend) ?? [];
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "ONE SIZE");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "Ivory");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { recentlyViewed, viewProduct, addToCart, addManyToCart, toggleWishlist, isWishlisted } = useVelouraStore();
  useEffect(()=>viewProduct(product.id),[product.id,viewProduct]);
  const navigate = useNavigate();
  // Recommend from live products — same-category or same-mood, exclude current
  const recommendations = liveProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.mood === product.mood))
    .slice(0, 3);
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
            <RestockAlertModal product={product} selectedSize={selectedSize} />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{product.stock < 8 ? `LOW STOCK — ${product.stock} LEFT` : "IN STOCK"}</p>
          <div className="mt-6 flex items-center gap-3">
            <Quantity value={quantity} onChange={setQuantity} />
            <Magnetic className="flex-1">
              <Button variant="editorial" className="w-full" onClick={() => addToCart(product, selectedSize, selectedColor, quantity)}>
                Add to Cart
              </Button>
            </Magnetic>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Magnetic>
              <Button
                variant="sage"
                className="w-full"
                onClick={() => {
                  addToCart(product, selectedSize, selectedColor, quantity);
                  navigate({ to: "/checkout" });
                }}
              >
                Buy Now
              </Button>
            </Magnetic>
            <Magnetic>
              <Button variant="outline" className="w-full" onClick={() => toggleWishlist(product.id)}>
                <Heart className={wished ? "fill-current text-sage" : ""} /> Wishlist
              </Button>
            </Magnetic>
          </div>
          <StylistConcierge product={product} selectedSize={selectedSize} selectedColor={selectedColor} />
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
  const [lens, setLens] = useState(false);
  const touchStart = useRef<number | null>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    event.currentTarget.style.setProperty("--lens-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--lens-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--lens-bg-x", `${70 - x * rect.width * 2.4}px`);
    event.currentTarget.style.setProperty("--lens-bg-y", `${70 - y * rect.height * 2.4}px`);
    event.currentTarget.style.setProperty("--lens-bg-width", `${rect.width * 2.4}px`);
    event.currentTarget.style.setProperty("--lens-bg-height", `${rect.height * 2.4}px`);
    setLens(true);
  };

  const currentSrc = product.images[image] || product.images[0];

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
      <div
        className="editorial-image group relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-muted focus-veloura cursor-crosshair select-none"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setLens(false)}
        onClick={() => setZoom((value) => !value)}
        role="button"
        tabIndex={0}
        aria-label="Inspect fabric weave or zoom product image"
      >
        <img
          src={currentSrc}
          alt={product.name}
          width={1200}
          height={1500}
          className={`h-full w-full object-cover transition-transform duration-500 ${zoom ? "scale-125" : "group-hover:scale-[1.02]"}`}
        />
        <span className={`fabric-lens ${lens ? "is-active" : ""}`} aria-hidden="true">
          <img src={currentSrc} alt="" />
        </span>
        <div className="absolute bottom-3 left-3 pointer-events-none rounded-full bg-background/85 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity border border-border shadow-xs">
          🔍 Hover to inspect fabric & weave
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {product.images.map((src, index) => (
          <button
            key={src}
            onClick={() => setImage(index)}
            className={`aspect-[4/5] overflow-hidden rounded-sm focus-veloura transition-all ${index === image ? "ring-2 ring-sage scale-102" : "opacity-80 hover:opacity-100"}`}
            aria-label={`Show image ${index + 1}`}
          >
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
    ["Delivery", "Complimentary standard delivery on orders over Rs. 15,000. Standard delivery arrives in 3–5 business days."],
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
  const liveProducts = productsData?.products?.map(fromBackend) ?? [];
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
  const liveProducts = productsData?.products?.map(fromBackend) ?? [];
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
          {discount ? <SummaryRow label="Discount" value={`−${formatPrice(discount)}`} /> : null}
          <SummaryRow label="Shipping" value={shipping ? formatPrice(shipping) : "Complimentary"} />
          <SummaryRow label="Total" value={formatPrice(cartTotal)} strong />
          <Button asChild variant="editorial" className="mt-5 w-full" disabled={!cart.length} onClick={closeCart}>
            <Link to="/checkout">Checkout</Link>
          </Button>
          {cart.length > 0 && (
            <SaveBagToWhatsApp cart={cart} liveProducts={liveProducts} cartTotal={cartTotal} />
          )}
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
          <p className="text-sm font-semibold">{miniCart.name}</p><p className="mt-1 text-xs text-muted-foreground">Size: {miniCart.size} · Color: {miniCart.color}</p>
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
  const liveProducts = productsData?.products?.map(fromBackend) ?? [];
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

  const user = authStorage.getUser();
  const [formData, setFormData] = useState(() => {
    let saved = null;
    if (typeof window !== "undefined") {
      try {
        saved = JSON.parse(localStorage.getItem("va_checkout_draft") || "null");
      } catch {
        saved = null;
      }
    }
    return {
      name: saved?.name || user?.full_name || "",
      email: saved?.email || user?.email || "",
      phone: saved?.phone || user?.phone || "",
      address: saved?.address || user?.address || "",
      city: saved?.city || user?.city || "",
      state: saved?.state || "Punjab",
      postalCode: saved?.postalCode || user?.postal_code || "",
      country: saved?.country || "Pakistan",
    };
  });

  const leadTimeoutRef = useRef<number | null>(null);

  const captureLead = (data: typeof formData, immediate = false) => {
    if (!data.phone && !data.email && !data.name) return;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("va_checkout_draft", JSON.stringify(data));
      } catch {}
    }
    const send = () => {
      void api.trackLead({
        name: data.name.trim() || undefined,
        phone: data.phone.trim() || undefined,
        email: data.email.trim() || undefined,
        address: data.address.trim() || undefined,
        city: data.city.trim() || undefined,
        stage: "checkout",
        items: cart,
        item_count: cart.length,
        cart_value: cartTotal,
        currency: getActiveCurrency(),
        notes: "Checkout in progress — details auto-saved",
      });
    };

    if (immediate) {
      if (leadTimeoutRef.current) window.clearTimeout(leadTimeoutRef.current);
      send();
      return;
    }

    if (leadTimeoutRef.current) window.clearTimeout(leadTimeoutRef.current);
    leadTimeoutRef.current = window.setTimeout(send, 750);
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    captureLead(updated, false);
  };

  const handleFieldBlur = () => {
    captureLead(formData, true);
  };

  const paymentMethods: string[] = [];
  if (settingsData?.payment?.cod_enabled !== false) paymentMethods.push('Cash on Delivery');
  if (settingsData?.payment?.easypaisa_enabled) paymentMethods.push(`EasyPaisa · ${settingsData.payment.easypaisa_number ?? ''}`);
  if (settingsData?.payment?.jazzcash_enabled) paymentMethods.push(`JazzCash · ${settingsData.payment.jazzcash_number ?? ''}`);
  if (settingsData?.payment?.bank_enabled) paymentMethods.push(`Bank Transfer · ${settingsData.payment.bank_name ?? ''}`);
  if (!paymentMethods.length) paymentMethods.push('Cash on Delivery');

  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] ?? "Cash on Delivery");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    captureLead(formData, true);
    const order = createOrder({
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      },
      address: {
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        state: formData.state,
      },
      paymentMethod,
      discount,
      coupon,
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
      <Logo className="mt-5 size-24" />
      <h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">CHECKOUT</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Secure checkout. 100% Cash on Delivery available nationwide with verified SMS & WhatsApp tracking.
      </p>
      <form onSubmit={submit} className="mt-12 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <CheckoutGroup title="Contact Details">
            <CheckoutInput
              name="name"
              label="Full Name"
              required
              value={formData.name}
              onChange={(v) => handleFieldChange("name", v)}
              onBlur={handleFieldBlur}
            />
            <CheckoutInput
              name="email"
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(v) => handleFieldChange("email", v)}
              onBlur={handleFieldBlur}
            />
            <CheckoutInput
              name="phone"
              label="WhatsApp / Mobile Number"
              type="tel"
              required
              value={formData.phone}
              onChange={(v) => handleFieldChange("phone", v)}
              onBlur={handleFieldBlur}
            />
          </CheckoutGroup>
          <CheckoutGroup title="Delivery Address">
            <CheckoutInput
              name="address"
              label="Street Address / House No."
              required
              value={formData.address}
              onChange={(v) => handleFieldChange("address", v)}
              onBlur={handleFieldBlur}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <CheckoutInput
                name="city"
                label="City"
                required
                value={formData.city}
                onChange={(v) => handleFieldChange("city", v)}
                onBlur={handleFieldBlur}
              />
              <CheckoutInput
                name="state"
                label="Province / State"
                required
                value={formData.state}
                onChange={(v) => handleFieldChange("state", v)}
                onBlur={handleFieldBlur}
              />
              <CheckoutInput
                name="postalCode"
                label="Postal Code"
                value={formData.postalCode}
                onChange={(v) => handleFieldChange("postalCode", v)}
                onBlur={handleFieldBlur}
              />
            </div>
          </CheckoutGroup>
          <CheckoutGroup title="Delivery Method">
            <div className="flex flex-wrap gap-3">
              {["Standard", "Express"].map((method) => (
                <Button
                  type="button"
                  key={method}
                  variant={deliveryMethod === method ? "editorial" : "outline"}
                  onClick={() => setDeliveryMethod(method)}
                >
                  {method} · {method === "Express" ? "1–2 days priority" : "3–5 days standard"}
                </Button>
              ))}
            </div>
          </CheckoutGroup>
          <CheckoutGroup title="Payment Method">
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-sm border border-border p-4 text-left text-sm focus-veloura transition ${
                    paymentMethod === method ? "bg-secondary ring-2 ring-sage shadow-xs" : "bg-transparent"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            {settingsData?.payment?.payment_note ? (
              <p className="mt-3 text-sm text-muted-foreground">{settingsData.payment.payment_note}</p>
            ) : null}
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

function CheckoutInput({
  name,
  label,
  type = "text",
  required,
  value,
  onChange,
  onBlur,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        minLength={name === "name" ? 2 : name === "address" ? 5 : undefined}
        pattern={name === "phone" ? "[+0-9() -]{7,20}" : name === "postalCode" ? "[A-Za-z0-9 -]{3,10}" : undefined}
        className="mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus-veloura"
      />
    </label>
  );
}

export function OrderSummary({ cart, subtotal, shipping, total, actionLabel, orderDiscount }: { cart: CartItem[]; subtotal: number; shipping: number; total: number; actionLabel?: string; orderDiscount?: number }) {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.map(fromBackend) ?? [];
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
        {(orderDiscount ?? (actionLabel ? discount : 0)) > 0 ? <SummaryRow label="Discount" value={`−${formatPrice(orderDiscount ?? discount)}`} /> : null}
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
  // Refresh order status every 10 seconds while actively tracking
  useEffect(() => {
    if (!apiEnabled || !remote) return;
    const t = window.setInterval(() => {
      api.trackOrder(remote.order_number, email.trim())
        .then(r => setRemote(r.order))
        .catch(() => {});
    }, 10_000);
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
            <p className="editorial-label">{remote?.order_number ?? local?.backendOrderNumber ?? local?.id}{cancelled ? " � CANCELLED" : ""}</p>
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

// ─── Curated Collections Page ────────────────────────────────────────────────
const FALLBACK_COLLECTIONS = [
  {
    id: "col-leather",
    name: "Men's Leather Collection",
    slug: "mens-leather-collection",
    tagline: "Signature Genuine Biker, Aviator & Suede Jackets",
    image_url: campaignImages.one,
    description: "Handcrafted genuine leather jackets featuring structured shoulders, heavy-gauge YKK hardware, and tailored silhouettes for everyday distinction.",
  },
  {
    id: "col-shirts",
    name: "Shirts & Overshirts Edit",
    slug: "shirts-overshirts-edit",
    tagline: "Oxford Button-Downs, Twill Utility & Flannels",
    image_url: campaignImages.three,
    description: "Breathable crisp Oxford button-downs, heavyweight twill utility shirts, and relaxed camp-collar linen tops.",
  },
  {
    id: "col-pants",
    name: "Pants & Tailored Trousers",
    slug: "pants-tailored-trousers",
    tagline: "Pleated Trousers, Stretch Chinos & Utility Cargos",
    image_url: campaignImages.four,
    description: "Relaxed pleated trousers, structured utility cargo pants, and Japanese selvedge denim built for daily rotation.",
  },
  {
    id: "col-outfits",
    name: "Complete Men's Outfits",
    slug: "complete-mens-outfits",
    tagline: "Coordinated Sets, Merino Knitwear & Tailored Suits",
    image_url: campaignImages.two,
    description: "Curated head-to-toe styling: relaxed two-piece suits, camel wool overcoats, 450 GSM hoodies, and fine knitwear.",
  },
];

const COLLECTION_CATEGORIES = [
  { label: "All Categories", slug: "all" },
  { label: "Leather Jackets", slug: "leather-jackets" },
  { label: "Shirts", slug: "shirts" },
  { label: "Trousers & Pants", slug: "trousers-pants" },
  { label: "Men's Outfits", slug: "mens-outfits" },
  { label: "Hoodies & Knitwear", slug: "hoodies-knitwear" },
  { label: "Jackets & Outerwear", slug: "jackets-outerwear" },
];

export function CollectionsPage() {
  const { data: productsData } = useProducts();
  const liveProducts = productsData?.products?.map(fromBackend) ?? [];
  const { data: collectionsData } = useCollections();
  const dbCollections = (collectionsData?.collections ?? []).filter((c) => c.active !== false);

  const collectionsList = useMemo(() => {
    if (!dbCollections.length) return FALLBACK_COLLECTIONS;
    return dbCollections.map((dbCol) => {
      const fb = FALLBACK_COLLECTIONS.find(
        (f) => f.slug === dbCol.slug || f.name.toLowerCase() === dbCol.name.toLowerCase()
      );
      return {
        id: dbCol.id,
        name: dbCol.name,
        slug: dbCol.slug,
        tagline: dbCol.tagline || fb?.tagline || "Curated Menswear Edit",
        image_url: dbCol.image_url ? assetUrl(dbCol.image_url) : (fb?.image_url || campaignImages.one),
        description: fb?.description || "Modern menswear essentials designed around clean silhouettes and durable craftsmanship.",
      };
    });
  }, [dbCollections]);

  const routerState = useRouterState();
  const navigate = useNavigate();
  const searchParams = (routerState.location.search || {}) as {
    collection?: string;
    category?: string;
    sort?: string;
  };

  const [activeCollection, setActiveCollection] = useState<string>(searchParams.collection || "all");
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.category || "all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<string>(searchParams.sort || "Featured");

  // Keep state synchronized with URL search params
  useEffect(() => {
    setActiveCollection(searchParams.collection || "all");
    setActiveCategory(searchParams.category || "all");
  }, [searchParams.collection, searchParams.category]);

  const norm = (s?: string | null) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

  const handleSelectCollection = (slug: string) => {
    const nextCol = activeCollection === slug ? "all" : slug;
    setActiveCollection(nextCol);
    navigate({
      to: "/collections",
      search: {
        collection: nextCol === "all" ? undefined : nextCol,
        category: activeCategory === "all" ? undefined : activeCategory,
        sort: sort !== "Featured" ? sort : undefined,
      } as never,
      replace: true,
    });
  };

  const handleSelectCategory = (catSlug: string) => {
    const nextCat = activeCategory === catSlug ? "all" : catSlug;
    setActiveCategory(nextCat);
    navigate({
      to: "/collections",
      search: {
        collection: activeCollection === "all" ? undefined : activeCollection,
        category: nextCat === "all" ? undefined : nextCat,
        sort: sort !== "Featured" ? sort : undefined,
      } as never,
      replace: true,
    });
  };

  const handleClearFilters = () => {
    setActiveCollection("all");
    setActiveCategory("all");
    setQuery("");
    navigate({
      to: "/collections",
      search: {} as never,
      replace: true,
    });
  };

  // Strict, mutually exclusive filtering
  const filteredProducts = useMemo(() => {
    let list = liveProducts.filter((product) => {
      // 1. Keyword search
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const hay = [
          product.name,
          product.description,
          product.category,
          product.collection,
          ...(product.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // 2. Strict Collection Match
      if (activeCollection && activeCollection !== "all") {
        const targetCol = norm(activeCollection);
        const pCol = norm(product.collection);

        let colMatches = false;
        if (pCol && (pCol === targetCol || pCol.includes(targetCol) || targetCol.includes(pCol))) {
          colMatches = true;
        } else if (targetCol.includes("leather") && (norm(product.category).includes("leather") || product.tags?.some((t) => norm(t).includes("leather")))) {
          colMatches = true;
        } else if (targetCol.includes("shirt") && (norm(product.category) === "shirts" || norm(product.category) === "shirt")) {
          colMatches = true;
        } else if ((targetCol.includes("pant") || targetCol.includes("trouser")) && (norm(product.category).includes("trouser") || norm(product.category).includes("pant"))) {
          colMatches = true;
        } else if (targetCol.includes("outfit") && (norm(product.category).includes("outfit") || norm(product.category).includes("hoodie") || norm(product.category).includes("knitwear") || pCol.includes("outfit"))) {
          colMatches = true;
        }
        if (!colMatches) return false;
      }

      // 3. Strict Category Match (mutually exclusive)
      if (activeCategory && activeCategory !== "all") {
        const targetCat = norm(activeCategory);
        const pCat = norm(product.category);

        if (targetCat.includes("leather")) {
          // STRICT: MUST be Leather Jackets only!
          const isLeather = pCat.includes("leather") || product.tags?.some((t) => norm(t).includes("leather"));
          if (!isLeather) return false;
        } else if (targetCat === "shirts" || targetCat === "shirt") {
          // STRICT: MUST be Shirts only!
          if (pCat !== "shirts" && pCat !== "shirt") return false;
        } else if (targetCat.includes("trouser") || targetCat.includes("pant")) {
          // STRICT: MUST be Trousers / Pants only!
          if (!pCat.includes("trouser") && !pCat.includes("pant") && !pCat.includes("cargo") && !pCat.includes("denim")) return false;
        } else if (targetCat.includes("mensoutfit") || targetCat === "outfits" || targetCat === "outfit") {
          // STRICT: MUST be Men's Outfits only!
          if (!pCat.includes("outfit") && !pCat.includes("suit")) return false;
        } else if (targetCat.includes("hoodie") || targetCat.includes("knitwear")) {
          // STRICT: MUST be Hoodies & Knitwear only!
          if (!pCat.includes("hoodie") && !pCat.includes("knitwear") && !pCat.includes("sweater") && !pCat.includes("cardigan")) return false;
        } else if (targetCat.includes("outerwear") || targetCat === "jackets") {
          // STRICT: Outerwear (non-leather)
          if ((!pCat.includes("outerwear") && pCat !== "jackets") || pCat.includes("leather")) return false;
        } else {
          if (pCat !== targetCat) return false;
        }
      }

      return true;
    });

    // Sorting
    if (sort === "Price: Low to High") list = [...list].sort((a, b) => productPrice(a) - productPrice(b));
    else if (sort === "Price: High to Low") list = [...list].sort((a, b) => productPrice(b) - productPrice(a));
    else if (sort === "Newest") list = [...list].sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    else if (sort === "Best Rated") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "Best Selling") list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    else if (sort === "Featured") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));

    return list;
  }, [liveProducts, activeCollection, activeCategory, query, sort]);

  // Current collection object
  const currentCollectionMeta = collectionsList.find(
    (c) => c.slug === activeCollection || norm(c.name) === norm(activeCollection)
  );

  // Active Category label
  const currentCategoryMeta = COLLECTION_CATEGORIES.find((c) => c.slug === activeCategory);

  return (
    <main className="pb-24 pt-28">
      {/* ── Editorial Header ────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <img
            src={currentCollectionMeta?.image_url || campaignImages.one}
            alt="Collection background"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="editorial-label text-primary-foreground/75">
              VELOURA MENSWEAR / CURATED EDITS
            </span>
            <span className="h-1 w-1 rounded-full bg-sage" />
            <span className="text-xs font-semibold uppercase tracking-wider text-sage">
              100% Cash on Delivery Nationwide
            </span>
          </div>

          <h1 className="mt-4 font-display text-5xl leading-none tracking-tight sm:text-7xl lg:text-8xl">
            {currentCollectionMeta
              ? currentCollectionMeta.name.toUpperCase()
              : activeCategory !== "all"
              ? (currentCategoryMeta?.label || "CATEGORY").toUpperCase()
              : "THE CURATED COLLECTIONS"}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            {currentCollectionMeta?.description ||
              (activeCategory !== "all"
                ? `Explore our dedicated ${currentCategoryMeta?.label} edit — exclusively tailored with refined silhouettes and premium textiles.`
                : "Explore our four dedicated menswear collections. Each piece is designed for quiet confidence, architectural tailoring, and effortless everyday rotation.")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-primary-foreground/70">
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-sage" /> Free Delivery over Rs. 4,999
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-sage" /> Genuine Leather & Tailored Textiles
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-sage" /> Verified Order Tracking
            </span>
          </div>
        </div>
      </section>

      {/* ── Collection Selector Cards ───────────────────── */}
      <section className="border-b border-border bg-secondary/50 py-8">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Select Collection
            </p>
            {activeCollection !== "all" && (
              <button
                onClick={() => handleSelectCollection("all")}
                className="text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-80"
              >
                View All Collections
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {/* All Collections Tile */}
            <button
              onClick={() => handleSelectCollection("all")}
              className={`group flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                activeCollection === "all"
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${activeCollection === "all" ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                  Complete Catalog
                </span>
                <p className="mt-1 font-display text-lg font-semibold leading-snug">
                  All Collections
                </p>
              </div>
              <p className={`mt-4 text-xs ${activeCollection === "all" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {liveProducts.length} Total Pieces
              </p>
            </button>

            {/* Collection Cards */}
            {collectionsList.map((col) => {
              const isSelected = activeCollection === col.slug;
              const colCount = liveProducts.filter((p) => {
                const targetCol = norm(col.slug);
                const pCol = norm(p.collection);
                if (pCol && (pCol === targetCol || pCol.includes(targetCol) || targetCol.includes(pCol))) return true;
                if (targetCol.includes("leather") && (norm(p.category).includes("leather") || p.tags?.some((t) => norm(t).includes("leather")))) return true;
                if (targetCol.includes("shirt") && (norm(p.category) === "shirts" || norm(p.category) === "shirt")) return true;
                if ((targetCol.includes("pant") || targetCol.includes("trouser")) && (norm(p.category).includes("trouser") || norm(p.category).includes("pant"))) return true;
                if (targetCol.includes("outfit") && (norm(p.category).includes("outfit") || norm(p.category).includes("hoodie") || norm(p.category).includes("knitwear") || pCol.includes("outfit"))) return true;
                return false;
              }).length;

              return (
                <button
                  key={col.id}
                  onClick={() => handleSelectCollection(col.slug)}
                  className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/40 shadow-lg"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={col.image_url}
                      alt={col.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {isSelected && (
                      <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow">
                        Active
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 rounded-sm bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                      {colCount} Pieces
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm font-semibold leading-tight line-clamp-1">
                      {col.name}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                      {col.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Main Catalog with Strict Category Filtering ── */}
      <section className="mx-auto max-w-[1500px] px-5 pt-10 sm:px-8 lg:px-12">
        {/* Category Pills Strip */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden sm:inline-block">
              Filter By Category:
            </span>
            {COLLECTION_CATEGORIES.map((cat) => {
              const isCatActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    isCatActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-secondary/80 text-foreground hover:bg-secondary hover:border-foreground/30"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {filteredProducts.length} pieces found
            </span>
          </div>
        </div>

        {/* Filter Controls Bar (Search + Sort + Active Indicators) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
          {/* Search within collection */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title, material, color, tag..."
              className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-10 pr-4 text-xs focus-veloura placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Sort:</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-full border border-border bg-secondary/60 py-2 pl-3.5 pr-8 text-xs font-semibold focus-veloura"
              >
                <option value="Featured">Featured</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Newest">Newest Arrivals</option>
                <option value="Best Rated">Customer Rating</option>
                <option value="Best Selling">Best Selling</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Active Filters Summary Chips */}
        {(activeCollection !== "all" || activeCategory !== "all" || query) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Active filters:</span>
            {activeCollection !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-semibold text-foreground border border-border">
                Collection: {currentCollectionMeta?.name || activeCollection}
                <button
                  onClick={() => handleSelectCollection("all")}
                  className="hover:text-destructive"
                  aria-label="Remove collection filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {activeCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-semibold text-foreground border border-border">
                Category: {currentCategoryMeta?.label || activeCategory}
                <button
                  onClick={() => handleSelectCategory("all")}
                  className="hover:text-destructive"
                  aria-label="Remove category filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {query && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-semibold text-foreground border border-border">
                Search: "{query}"
                <button
                  onClick={() => setQuery("")}
                  className="hover:text-destructive"
                  aria-label="Clear search"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="font-semibold text-primary underline underline-offset-4 hover:opacity-80 ml-2"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* ── Products Grid or Empty State ───────────────── */}
        <div className="mt-8">
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="font-display text-2xl font-semibold">No products found</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                No items match your active filters ({activeCategory !== "all" ? currentCategoryMeta?.label : ""}
                {activeCollection !== "all" ? ` in ${currentCollectionMeta?.name}` : ""}).
              </p>
              <Button onClick={handleClearFilters} variant="editorial" className="mt-6">
                Clear Filters & Show All Products
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Lookbook & Customer Confidence ──────────────── */}
      <section className="mt-20">
        <BuildYourLook liveProducts={liveProducts} />
      </section>
      <ShoppingConfidence />
      <NewsletterBand />
    </main>
  );
}
