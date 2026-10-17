# Homepage Rebuild — Implementation Plan

## Project context

- **Workspace root**: `c:\Users\JalipEmpire\Downloads\New folder (9)\veloura-apparel-main`
- **Primary file**: `src/components/veloura/commerce.tsx`
- **Build**: `npm run build` (Vite + TanStack Start)
- **Type-check**: `npx tsc --noEmit`
- **Dev server**: `npm run dev`
- **No test runner is configured** — verify via TypeScript build passing and visual inspection

## Already-available imports (do NOT re-import these)

From the top of `commerce.tsx` these are already imported:

```ts
// Lucide icons
import { Truck, RotateCcw, ShieldCheck, Sparkles, Pause, Play,
         ArrowLeft, ArrowRight, Check, Heart, Menu, Plus, Search,
         ShoppingBag, X } from "lucide-react";

// Hooks
import { useSettings, useHeroSlides, useBlogPosts, useProducts,
         useCollections, useDeals, useCoupons, apiEnabled } from "@/lib/api";

// live-catalog
import { assetUrl, fromBackend, LiveDeals } from "@/lib/live-catalog";

// veloura-data
import {
  articles, campaignImages, categories, colors, formatPrice,
  productPrice, storeConfig, sizes, type Product
} from "@/lib/veloura-data";

// Assets already imported at top of file
import bannerDrop from "@/assets/mens-campaign-everyday.jpg";   // = campaignImages.two
import bannerAccessories from "@/assets/mens-accessories.jpg";   // = campaignImages.four

// useCategories is NOT yet imported — add it to the useQuery imports line
import { useCategories } from "@/lib/api";
```

`useCategories()` returns `{ data: { categories: CategoryPayload[] } }` where
`CategoryPayload = { id, name, slug, image_url? }`. This hook exists in `api.ts`
but is not imported in `commerce.tsx` yet — add it to the existing import line.

`useEffect, useMemo, useRef, useState` are already imported from `"react"`.
`Button` is imported from `"@/components/ui/button"`.
`Link, useNavigate, useRouterState` are imported from `"@tanstack/react-router"`.

---

## What to KEEP unchanged

The following functions/exports must **not be touched**:

- `SiteChrome`, `Footer`, `Navbar` exports
- `SearchOverlay`, `CartDrawer`, `MiniCart` (functions inside `SiteChrome`)
- `ShopPage`, `ProductDetailPage`, `OrderPage`, `CheckoutPage`, `WishlistPage`
- `ProductCard`, `ProductGrid`, `SectionHeader`, `ArticleCard`
- `BuildYourLook`, `ArticleCard`, `Reveal`, `Tilt`, `Parallax`, `Magnetic`
- `MarqueeStrip`, `DropBanner`, `SplitBanners`, `FeaturedProducts`, `AboutPreview`
- `EditorialBanner`, `CompactProduct`, `Badge`, `BentoTile`
- `LinkText`, `Quantity`, `LookProduct`, `SizeGuide`
- `FilterPanel`, `FilterInput`, `FilterSelect`
- `ProductAccordions`, `ProductGallery`
- `NewsletterBand` (export — improve styling in step 13 only)

---

## Implementation steps

---

- [ ] 1. **Add `useCategories` to the api import line**

  The hook is defined in `api.ts` but not currently imported in `commerce.tsx`.
  Find the existing import line that includes `useSettings, useHeroSlides, ...`
  and append `useCategories` to it.

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no new errors.

---

- [ ] 2. **Rebuild `HeroCarousel`**

  Replace the existing `HeroCarousel` function (lines ~510–540 in current file)
  with the improved version below. Keep the outer structure but fix:
  - Slide counter text to read `0${index+1} / 0${slides.length}` (already present — keep)
  - First image uses `loading="eager" fetchPriority="high"` (already correct — keep)
  - Secondary CTA explicitly reads `"The Collection"` pointing to `/collections`
  - Pause/play button using `Pause`/`Play` icons (already correct — keep)
  - Skeleton on empty: `<div className="veloura-hero relative overflow-hidden bg-secondary animate-pulse" />` (already present — keep)
  - Auto-advance uses 6500ms (already present — keep)
  - Add `prefers-reduced-motion` guard to the `useEffect` timer:

  ```tsx
  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const timer = window.setInterval(() => setIndex(i => (i + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);
  ```

  The current HeroCarousel already satisfies most requirements. The one change
  needed: map `s.eyebrow` to `slide.label`, `s.title` to `slide.headline`,
  `s.description` to `slide.text` (already done in existing code). Confirm the
  secondary CTA button reads `"The Collection"` (currently `"The collection"` —
  capitalise to match spec: `"The Collection"`).

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 3. **Rebuild `TrustStrip`**

  Replace the existing one-liner `TrustStrip` function with this expanded version:

  ```tsx
  function TrustStrip() {
    const { data } = useSettings();
    const freeAbove = data?.payment?.free_delivery_above ?? storeConfig.freeShippingThreshold;
    const items: [React.ElementType, string, string][] = [
      [Truck,        "Free delivery",          `From ${formatPrice(freeAbove)} on all orders`],
      [RotateCcw,    "Size guides",            "Measurements on every product"],
      [ShieldCheck,  "Cash on Delivery",       "Available nationwide"],
      [Sparkles,     "Exclusive offers",       "Members get first access"],
    ];
    return (
      <section aria-label="Shopping benefits" className="border-y border-border bg-secondary">
        <div className="mx-auto flex max-w-[1400px] overflow-x-auto divide-x divide-border">
          {items.map(([Icon, label, sub]) => (
            <div key={label} className="flex shrink-0 flex-1 items-center gap-3 px-6 py-4 min-w-[180px]">
              <Icon className="size-5 shrink-0 text-sage" />
              <div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[11px] text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 4. **Rebuild `CategorySection`**

  Replace the existing `CategorySection` (which uses `BentoTile`) with the
  spec-compliant version below. Keep the function signature
  `({ liveProducts }: { liveProducts: Product[] })` unchanged.

  Design decisions:
  - Load from `useCategories()`. If DB returns empty, use 6 hardcoded fallbacks.
  - Fallback categories: `["Jackets","T-Shirts","Shirts","Watches","Accessories","Fragrance"]`
    each with path `/shop?category=X` and a campaign image from `campaignImages`.
  - Asymmetric desktop grid: first tile spans 2 rows (large), rest are smaller.
  - Hover zoom on the inner `<img>`.

  ```tsx
  const FALLBACK_CATS = [
    { id:"f1", name:"Jackets",     slug:"Jackets",     image_url: campaignImages.one  },
    { id:"f2", name:"T-Shirts",    slug:"T-Shirts",    image_url: campaignImages.two  },
    { id:"f3", name:"Shirts",      slug:"Shirts",      image_url: campaignImages.three },
    { id:"f4", name:"Watches",     slug:"Watches",     image_url: campaignImages.four  },
    { id:"f5", name:"Accessories", slug:"Accessories", image_url: bannerAccessories   },
    { id:"f6", name:"Fragrance",   slug:"Fragrance",   image_url: campaignImages.one  },
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
            {[0,1,2,3,4,5].map(i => (
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
                  to="/shop"
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
  ```

  Note: `FALLBACK_CATS` entries use static images (not `assetUrl`), so they work
  without a backend. For DB images, `assetUrl()` is called inside the map.

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 5. **Add `SkeletonCard` helper and `NewArrivalsShelf` (NEW)**

  Insert just before the `SaleBanner` function. This is a brand-new component.

  ```tsx
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
            {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <ProductGrid products={shelfProducts} />
        )}
      </section>
    );
  }
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 6. **Add `BestSellersShelf` (NEW)**

  Insert after `NewArrivalsShelf`. Uses a tab switcher between best sellers and
  new arrivals. Uses plain `useState` for the active tab — no external library.

  ```tsx
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
          {(["best","new"] as const).map(t => (
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
            {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <ProductGrid products={displayed} />
        )}
      </section>
    );
  }
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 7. **Add `FeaturedCampaignJackets` (NEW)**

  Insert after `BestSellersShelf`. This is a static editorial split layout.
  Image: use `campaignImages.one` (already imported via `campaignImages`).

  ```tsx
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
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 8. **Rebuild `DealsShowcase`**

  Replace the current `DealsShowcase` function with the spec-compliant version.
  The key differences from what exists: new eyebrow/headline, deal cards show
  `deal.image_url` as background (not just an img tag), include badge chip,
  improved CTA button.

  ```tsx
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
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 9. **Rebuild `CollectionsStrip`**

  Replace the existing `CollectionsStrip` with the spec version. Main change:
  new eyebrow/headline copy and explicit `3:4` aspect-ratio with ~260px width.

  ```tsx
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
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 10. **Add `BudgetSection` (NEW)**

  Insert after `CollectionsStrip`. Receives already-filtered `products` prop.

  ```tsx
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
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 11. **Add `WatchesAccessoriesSection` (NEW)**

  Insert after `BudgetSection`. Uses `useCategories()` to find Watches,
  Accessories, Fragrance tiles; falls back to gradient placeholders.

  ```tsx
  function WatchesAccessoriesSection() {
    const { data: catData } = useCategories();
    const allCats = catData?.categories ?? [];

    const TILES = [
      { name: "Watches",     slug: "Watches",     gradient: "from-amber-900/80 to-stone-800/80" },
      { name: "Accessories", slug: "Accessories", gradient: "from-stone-800/80 to-zinc-700/80"  },
      { name: "Fragrance",   slug: "Fragrance",   gradient: "from-zinc-800/80 to-slate-700/80"  },
    ];

    return (
      <section className="store-section">
        <SectionHeader
          label="THE FINISHING TOUCH"
          title="Details Make the Difference."
        />
        <p className="mb-7 max-w-lg text-sm leading-6 text-muted-foreground">
          Accessories that bring a polished finish to your everyday style.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {TILES.map(tile => {
            const cat = allCats.find(c => c.slug === tile.slug || c.name === tile.name);
            const img = cat?.image_url ? assetUrl(cat.image_url) : null;
            return (
              <Link
                key={tile.slug}
                to="/shop"
                search={{ category: tile.slug } as never}
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
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 12. **Add `BrandStorySection` (NEW)**

  Insert after `WatchesAccessoriesSection`. Uses `campaignImages.two` (already
  imported as `bannerDrop` and via `campaignImages`). Uses `campaignImages.two`
  directly.

  ```tsx
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
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 13. **Rebuild `JournalPreview`**

  Replace existing `JournalPreview` with the spec version: 3-col grid,
  each card shows image (16:9), category badge, title, excerpt clamped
  to 2 lines, "Read Article →" link. Returns `null` when no posts.

  ```tsx
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
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 14. **Improve `NewsletterBand` styling**

  The `NewsletterBand` export already exists. Apply dark-bg premium styling
  by wrapping the existing `<section>` in a charcoal background. Change:
  - Outer section: add `bg-primary text-primary-foreground`
  - `editorial-label` `<p>`: add `text-primary-foreground/70`
  - `<h2>`: add `text-primary-foreground`
  - Description `<p>`: change `text-muted-foreground` → `text-primary-foreground/70`
  - Input: `bg-transparent` stays; `border-border` → `border-primary-foreground/30`
  - Button: `variant="ghost"` → `variant="secondary"` for contrast
  - Success text: `text-sage` → keep (sage shows on dark bg)

  Exact replacement in `NewsletterBand`:

  Change the section className from:
  ```tsx
  className="px-5 py-20 sm:px-8 lg:px-12"
  ```
  to:
  ```tsx
  className="bg-primary text-primary-foreground px-5 py-20 sm:px-8 lg:px-12"
  ```

  Change description `<p>` className from:
  ```tsx
  className="mx-auto mt-5 max-w-xl leading-7 text-muted-foreground"
  ```
  to:
  ```tsx
  className="mx-auto mt-5 max-w-xl leading-7 text-primary-foreground/70"
  ```

  Change input border from `border-border` to `border-primary-foreground/30`.

  Change `<Button type="submit" variant="ghost"` to `variant="secondary"`.

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 15. **Upgrade `ProductCard`**

  Improve the existing exported `ProductCard` to match spec:
  - Image aspect ratio: change `aspect-[3/4]` → `aspect-[4/5]`
  - Hover second image: already present but uses `opacity-0 group-hover:opacity-100` — keep
  - Sale badge chip: add a red chip overlaying the image when `product.salePrice` is set,
    showing the discount %. Insert after the existing badge row:

  ```tsx
  {product.salePrice && product.price > 0 && (
    <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[0.6rem] font-bold text-white">
      {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
    </span>
  )}
  ```

  - Quick-add button visibility: the existing "Quick Add" `<Button>` shows always.
    Make it desktop-hover-only: add `hidden group-hover:flex md:flex` to the button
    (always visible on mobile since viewport is touch):

  Change existing:
  ```tsx
  <Button variant="outline" size="sm" className="mt-4 w-full" onClick={...}>
  ```
  to:
  ```tsx
  <Button variant="outline" size="sm" className="mt-4 w-full md:opacity-0 md:group-hover:opacity-100 md:transition-opacity" onClick={...}>
  ```

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 16. **Rewrite `HomePage` export**

  Replace the entire `export function HomePage()` body (currently ends after
  `<NewsletterBand />`). Use the exact structure from the spec:

  ```tsx
  export function HomePage() {
    const { data: productsData } = useProducts();
    const liveProducts = productsData?.products?.map(fromBackend) ?? [];
    const newArrivalItems  = liveProducts.filter(p => p.newArrival).slice(0, 8);
    const bestSellerItems  = liveProducts.filter(p => p.bestSeller || p.featured).slice(0, 8);
    const budgetItems      = liveProducts.filter(p => p.price < 5000).slice(0, 4);

    return (
      <main>
        <HeroCarousel />
        <TrustStrip />
        <CategorySection liveProducts={liveProducts} />
        {newArrivalItems.length > 0 && <NewArrivalsShelf products={newArrivalItems} />}
        <SaleBanner />
        {bestSellerItems.length > 0 && (
          <BestSellersShelf products={bestSellerItems} newItems={newArrivalItems} />
        )}
        <FeaturedCampaignJackets />
        <DealsShowcase />
        <CollectionsStrip />
        {budgetItems.length > 0 && <BudgetSection products={budgetItems} />}
        <WatchesAccessoriesSection />
        <BrandStorySection />
        <JournalPreview />
        <HomeDeals />
        <ShoppingConfidence />
        <BuildYourLook liveProducts={liveProducts} />
        <NewsletterBand />
      </main>
    );
  }
  ```

  Note: `MarqueeStrip` is no longer rendered in `HomePage` (it was never in the
  original spec; the existing homepage did not render it either). Do not render
  `LiveDeals`, `DropBanner`, `SplitBanners`, `FeaturedProducts`, `AboutPreview`,
  `EditorialBanner` inside `HomePage` — these private helpers remain in the file
  for any future use but are not rendered from the homepage.

  Files: `src/components/veloura/commerce.tsx`
  Verify: `npx tsc --noEmit` — no errors.

---

- [ ] 17. **Final build verification**

  Run full Vite build and TypeScript check:

  ```
  npx tsc --noEmit
  npm run build
  ```

  Expected outcome: zero TypeScript errors, build completes without errors.
  If `npm run build` fails due to an asset reference or import issue, fix it
  before considering this step complete.

  Files: (none — verification only)
  Verify: `npm run build` exits with code 0.

---

## Edge cases and tricky details

### Type-safety for `search` prop on `<Link>`
TanStack Router's `<Link to="/shop" search={...}>` is strictly typed. When
passing `{ category: "X" }` dynamically, cast it as `never` or `unknown as never`
to silence the type error without touching route definitions:
```tsx
<Link to="/shop" search={{ category: cat.slug } as never}>
```

### `CategoryPayload` does not include `active` field
The `CategoryPayload` type in `api.ts` does not have an `active` field. When
filtering for active categories, cast it:
```tsx
.filter(c => (c as { active?: boolean }).active !== false)
```

### `BestSellersShelf` negative-margin pattern
The `-mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12` pattern breaks out of
`.store-section`'s padding to get full-bleed background while keeping content
contained. This is already used in the existing codebase for `SaleBanner`-style
sections.

### `HomeDeals` rendering condition
`HomeDeals` returns `null` when there is no coupon from DB. That is correct
behavior — the spec says to keep it.

### `ShoppingConfidence` import
`ShoppingConfidence` is imported from `./customer-confidence` at the top of
`commerce.tsx` — it is already available. Do not import it again.

### `fromBackend` sets `bestSeller` from `base?.bestSeller` (falls back to static data)
The `fromBackend` function in `live-catalog.tsx` uses `base?.bestSeller ?? false`
because the API `BackendProductPayload` has no `best_seller` field. This means
`bestSeller` will be `false` for products that don't have a static-data match.
The filter `p => p.bestSeller || p.featured` is correct: `featured` is passed
from backend, so `bestSellerItems` will contain featured products even when
`bestSeller` is false.

### Budget filter uses `p.price < 5000`
All prices in the static catalog are in Pakistani Rupees (already converted by
the `products` export in `veloura-data.ts` — the `price` field in the map is
`Math.max(0, Math.round(safeBasePrice * 0.4 / 100) * 100 - 10)`). Backend
products pass `Number(b.price)` directly. The threshold `5000` is consistent
with Rs. 5,000 displayed in the section heading.

### `useCategories` hook already exists in `api.ts`
Confirm the exact import path: the hook is `useCategories` exported from
`@/lib/api`. Only the import statement in `commerce.tsx` needs updating.
