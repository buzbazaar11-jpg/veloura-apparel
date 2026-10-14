# Implementation Plan — Veloura Apparel Master Rebuild

**Last updated by planning agent. Work decomposes into 3 FEATs (see `.agents/tasks/veloura-master/`).**

---

## Baseline: What is Already Done (do NOT redo)

- VA prefix on order numbers — `orders.py` line ~80: `order_number="VA" + now.strftime("%y%m%d") + secrets.token_hex(2).upper()`
- All database models in `backend/app/models.py`: Product, Category, Deal, Coupon, HeroSlide, Review, Faq, TrustSection, Collection, BlogPost, Order, SiteSettings, PaymentSettings etc.
- All public read endpoints in `backend/app/routers/public.py`: `/health`, `/products`, `/categories`, `/hero-slides`, `/faqs`, `/trust`, `/deals`, `/settings`, `/reviews`, `/blog`, `/collections`
- Generic admin CRUD: `PUT/POST/DELETE /api/v1/admin/r/{name}/{id}` — covers products, hero_slides, reviews, coupons, etc.
- Admin singletons: `GET/PUT /api/v1/admin/settings/{name}` — covers site_settings, payment_settings
- Order status update: `PATCH /api/v1/admin/orders/{id}` with status, courier, tracking_number
- Admin dashboard: KPI cards, SVG area/donut/stacked-bar charts, orders table with status dropdowns
- Admin panel light-luxury theme: CSS variables, responsive layout, mobile bottom nav
- Admin panel sidebar collapse (`colbtn`), mobile hamburger drawer, sticky top bar
- HeroCarousel already uses `useHeroSlides()` — falls back to static `heroSlides` if empty
- All products fetch via `useProducts()` React Query hook
- Footer already renders `data?.settings?.brand_tagline` from API
- Track page already uses `VA2610138F92` as placeholder
- `tm_admin_token` read was already added as backwards-compat fallback (need to remove it now)

---

## FEAT-001: Backend additions + Admin Panel enhancement

**Files:** `backend/app/models.py`, `backend/app/routers/public.py`, `backend/app/admin_panel/index.html`, `src/lib/api.ts`

- [ ] 1. Add `new_arrival` boolean column to `Product` model in `backend/app/models.py`.
      After the `featured` line add: `new_arrival = Column(Boolean, nullable=False, default=False)`
      Files: `backend/app/models.py`
      Verify: `python -m py_compile backend/app/models.py` — no output (success).

- [ ] 2. Expose `new_arrival` filter and add public `GET /api/v1/coupons` endpoint in `backend/app/routers/public.py`.
      In `products()`: add `new_arrival: bool | None = None` param and `.filter(Product.new_arrival.is_(new_arrival))` when set.
      Add new route `@router.get("/coupons")` returning active coupons with id, code, discount_type, discount_value, description only.
      Files: `backend/app/routers/public.py`
      Verify: `python -m py_compile backend/app/routers/public.py` — no output.

- [ ] 3. Add `CouponPublicPayload` type and `useCoupons()` hook to `src/lib/api.ts`.
      Add `new_arrival?: boolean` to `BackendProductPayload`.
      Use the existing `liveQuery` helper for `useCoupons` pointing to `/coupons` with empty `{ ok: true, coupons: [] }` placeholder.
      Files: `src/lib/api.ts`
      Verify: `npm run build` — 0 TypeScript errors.

- [ ] 4. Admin panel — remove `tm_admin_token` fallback, add 7d/30d/90d selector, add hero slides drag-to-reorder.
      (a) Remove `|| localStorage.getItem("tm_admin_token")` from TOKEN init and `localStorage.removeItem("tm_admin_token")` from `logout()`.
      (b) Add `let DAYS = 30;` global; change `dashboard()` to accept `days=DAYS` param and pass `?days=${days}` to `/admin/stats`. Render 3 buttons [7d | 30d | 90d] at top of dashboard that set DAYS and call `dashboard(n)`.
      (c) When `page === 'hero_slides'`, override the generic `crud()` output with a draggable-card layout instead of the generic table. Each card is `draggable=true` and uses `dragstart`/`dragover`/`drop` events to track order. On drop, call `PUT /api/v1/admin/r/hero_slides/{id}` for each card in the new order, saving its index as `sort_order`.
      Files: `backend/app/admin_panel/index.html`
      Verify: Load admin panel in browser, confirm no console errors (manual check); confirm `tm_admin_token` is gone via grep.

---

## FEAT-002: 100% Dynamic Homepage (depends on FEAT-001 completing first)

**Files:** `src/lib/live-catalog.tsx`, `src/components/veloura/commerce.tsx`

- [ ] 5. Fix `fromBackend()` in `src/lib/live-catalog.tsx` to read `new_arrival` from backend payload.
      Change: `newArrival: base?.newArrival ?? !base` → `newArrival: b.new_arrival ?? base?.newArrival ?? false`
      Files: `src/lib/live-catalog.tsx`
      Verify: `npm run build` — 0 errors.

- [ ] 6. Make `MarqueeStrip()` return null when `marquee_items` is empty (API enabled case).
      Remove hardcoded fallback array. When `apiEnabled` and items empty: `return null`. When `!apiEnabled`: render nothing too (marquee only renders from DB). Actually for offline-first, keep static fallback only when `!apiEnabled`.
      Files: `src/components/veloura/commerce.tsx`
      Verify: `npm run build` — 0 errors.

- [ ] 7. Make `HeroCarousel()` show a skeleton when apiEnabled + no slides.
      Remove `heroSlides` as fallback when `apiEnabled`. When apiEnabled and slides empty, return a minimal placeholder `<section id="hero" className="veloura-hero relative overflow-hidden bg-primary animate-pulse" aria-label="Loading..." />`. Offline (!apiEnabled): keep existing static `heroSlides` fallback.
      Files: `src/components/veloura/commerce.tsx`
      Verify: `npm run build` — 0 errors.

- [ ] 8. Make New Arrivals and Signature Edit product shelves conditional.
      In `HomePage()`, wrap each ProductGrid shelf in a conditional: only render section when the filtered array has length > 0. When apiEnabled and DB is empty, sections are simply absent.
      Files: `src/components/veloura/commerce.tsx`
      Verify: `npm run build` — 0 errors.

- [ ] 9. Make `SaleBanner()`, `DropBanner()`, `EditorialBanner()` dynamic from `useDeals()`.
      Import `useDeals` (already in api.ts). Each banner consumes deals[0], deals[1], deals[2] respectively by index. When apiEnabled and deal doesn't exist: `return null`. When `!apiEnabled`: render existing static content (offline-first preservation). Use `assetUrl(deal.image_url)` for banner images.
      Files: `src/components/veloura/commerce.tsx`
      Verify: `npm run build` — 0 errors.

- [ ] 10. Make `HomeDeals()` use the first active coupon from `useCoupons()`.
      Replace hardcoded `'WELCOME10'` with the first coupon from `couponsData?.coupons`. When apiEnabled and no coupons: hide the left panel entirely (show only the right panel static CTA). Offline: use existing hardcoded WELCOME10 reference.
      Files: `src/components/veloura/commerce.tsx`
      Verify: `npm run build` — 0 errors.

- [ ] 11. Make `CategorySection()` use a live Jackets product image for the hero bento tile instead of hardcoded `campaignImages.one`.
      Change: `img={campaignImages.one}` → `img={find('Jackets')?.images[0]}` in the hero BentoTile. The bento CSS handles undefined img gracefully.
      Files: `src/components/veloura/commerce.tsx`
      Verify: `npm run build` — 0 errors.

---

## FEAT-003: Dynamic customer-confidence.tsx (depends on FEAT-001; independent of FEAT-002)

**Files:** `src/components/veloura/customer-confidence.tsx`

- [ ] 12. Replace hardcoded FAQ `questions` array with `useFaqs()`.
      Store existing array as `HARDCODED_QUESTIONS` const. Import `useFaqs, apiEnabled` from `@/lib/api`. Derive: `const liveQs = faqData?.faqs?.map(f => [f.question, f.answer]) ?? []; const questions = apiEnabled ? liveQs : HARDCODED_QUESTIONS;`. When apiEnabled + empty: FAQ section is omitted (return null for that section, not an error state).
      Files: `src/components/veloura/customer-confidence.tsx`
      Verify: `npm run build` — 0 errors.

- [ ] 13. Replace hardcoded `offers` array with `useCoupons()`.
      Store existing `[['WELCOME10','10%'],...]` as `HARDCODED_OFFERS` const. Derive: `const liveCoupons = couponsData?.coupons ?? []; const offers = apiEnabled && liveCoupons.length ? liveCoupons.map(c => [c.code, c.discount_type==='percent' ? c.discount_value+'%' : 'Rs '+c.discount_value]) : (apiEnabled ? [] : HARDCODED_OFFERS);`. When apiEnabled and offers empty: omit the entire 'A LITTLE EXTRA, ON US' section.
      Files: `src/components/veloura/customer-confidence.tsx`
      Verify: `npm run build` — 0 errors.

- [ ] 14. Update `CustomerExtras()` popup to use first live coupon, hiding coupon UI when none available.
      Import `useCoupons` from `@/lib/api`. Derive `const firstCoupon = couponsData?.coupons?.[0]?.code ?? (apiEnabled ? null : 'WELCOME10')`. Use `firstCoupon` as `couponCode`. When `couponCode` is null: omit the coupon code display block and the 'Use my X% off' button; show only the 'Explore new arrivals' CTA button.
      Files: `src/components/veloura/customer-confidence.tsx`
      Verify: `npm run build` — 0 errors.

---

## Verification & Acceptance Criteria

1. `npm run build` — zero TypeScript errors, zero build warnings treated as errors.
2. `python -m py_compile backend/app/models.py backend/app/routers/public.py` — no output (success).
3. Admin Panel: Confirm `tm_admin_token` string no longer appears in `admin_panel/index.html`. Confirm 7d/30d/90d buttons present in dashboard HTML. Confirm drag-to-reorder present in hero slides view.
4. Order System: `VA` prefix already confirmed in `orders.py`. No regression from model migration (new_arrival column adds with default=False, no data loss).
5. Storefront: When `apiEnabled=true` and DB sections are empty — homepage omits sections cleanly rather than showing static dummy content.
6. When `apiEnabled=false` (no VITE_API_URL) — all offline-first fallbacks preserved (static heroSlides, hardcoded FAQs, static product data).

---

## FEAT Artifacts Location

Full FEAT specifications with detailed steps:
- `.agents/tasks/veloura-master/context.json` — project context
- `.agents/tasks/veloura-master/task.json` — task metadata
- `.agents/tasks/veloura-master/features/FEAT-001.json` — backend + admin panel
- `.agents/tasks/veloura-master/features/FEAT-002.json` — dynamic homepage
- `.agents/tasks/veloura-master/features/FEAT-003.json` — dynamic customer-confidence
