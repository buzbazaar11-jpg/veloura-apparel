# Implementation Plan — Veloura Static → Dynamic Wiring

> This task is decomposed into 3 FEAT artifacts under `.agents/tasks/task-static-to-dynamic/features/`.
> Read `context.json` first. Each FEAT is independently verifiable with `npm run build`.

---

## Decisions made during exploration

**QueryClient**: already set up in `src/routes/__root.tsx` via `createRootRouteWithContext<{ queryClient: QueryClient }>()` and passed as context. `@tanstack/react-query` v5 is installed.

**Backend endpoints confirmed available** (from `backend/app/routers/public.py`):
- `GET /api/v1/settings` → `{ settings: SiteSettings, payment: PaymentSettings }`
- `GET /api/v1/hero-slides` → `{ slides: HeroSlide[] }`
- `GET /api/v1/categories` → `{ categories: Category[] }`
- `GET /api/v1/blog` → `{ posts: BlogPost[] }`
- `GET /api/v1/blog/{slug}` → `{ post: BlogPost }`
- `GET /api/v1/reviews` → `{ reviews: Review[] }` (all approved, no product_id filter on server)
- `POST /api/v1/reviews` → `{ ok, message }` (approved=false by default)
- `GET /api/v1/popups` → `{ popups: Popup[] }`

**Live-catalog.tsx already handles**: products array mutation + deals polling every 8s. Do NOT duplicate this.

**Coupon validation**: `api.validateCoupon` already exists in api.ts; applyCoupon in veloura-store.tsx still uses the local static `coupons` record. Must be updated.

**No hooks/ directory to speak of**: only `src/hooks/use-mobile.tsx` exists. All new hooks go into `src/lib/api.ts` per AGENTS.md rule.

---

## FEAT-001 — Settings, hero, categories, blog, popups wired to DB

**Files**: `src/lib/api.ts`, `src/components/veloura/commerce.tsx`, `src/components/veloura/customer-confidence.tsx`

- [ ] 1. Add typed React Query hooks to `src/lib/api.ts`:
        `useSettings()`, `useHeroSlides()`, `useCategories()`, `useBlogPosts()`, `useBlogPost(slug)`, `useReviews(productId?)`, `usePopups()`.
        Also add `api.submitReview(body)` to the existing `api` object.
        All hooks: `enabled: apiEnabled`, correct staleTime, `refetchOnWindowFocus: true`, typed placeholderData as fallback.
        Files: `src/lib/api.ts`
        Verify: `npm run build`

- [ ] 2. Wire `Navbar` announcement bar to `data?.settings?.brand_tagline ?? storeConfig.announcement`.
        Wire `MarqueeStrip` items to `data?.settings?.marquee_items` (fallback to hardcoded array).
        Wire `Footer` social hrefs to `data?.settings?.instagram_url / tiktok_url` (fallback to current hrefs).
        Wire `TrustStrip` free-delivery text to `data?.payment?.free_delivery_above ?? storeConfig.freeShippingThreshold`.
        Wire `HeroCarousel` to use live slides when `heroData?.slides?.length > 0`, mapped to existing slide shape.
        Files: `src/components/veloura/commerce.tsx`
        Verify: `npm run build`

- [ ] 3. Wire `JournalPage` and `JournalPreview` to `useBlogPosts()`, mapping posts to Article shape with `assetUrl` image resolution.
        Wire `ArticleRoute` in `src/routes/journal.$slug.tsx` to `useBlogPost(slug)` — hydrate title/description/image from DB post if available.
        Files: `src/components/veloura/commerce.tsx`, `src/routes/journal.$slug.tsx`
        Verify: `npm run build`

- [ ] 4. Wire `ShoppingConfidence` to live `delivery_charge` and `free_delivery_above` from `useSettings()`.
        Wire `CustomerExtras` popup to first active DB popup from `usePopups()` (title, message, coupon_code, delay_seconds).
        Wire WhatsApp float button href to `data?.settings?.whatsapp_number`.
        Files: `src/components/veloura/customer-confidence.tsx`
        Verify: `npm run build`

---

## FEAT-002 — Coupon validation + checkout payment methods from DB

**Files**: `src/lib/veloura-store.tsx`, `src/components/veloura/commerce.tsx`, `src/components/veloura/shopping-ui.tsx`, `src/components/veloura/customer-confidence.tsx`

- [ ] 5. Rewrite `applyCoupon` in `veloura-store.tsx` to be async: try `api.validateCoupon` when `apiEnabled`, fall back to local `coupons` record on error/offline.
        Store discount percent from backend response so cart discount recalculates correctly.
        Expose live `standardShipping` and `freeShippingThreshold` from `useSettings()` in context.
        Files: `src/lib/veloura-store.tsx`
        Verify: `npm run build`

- [ ] 6. Update all `applyCoupon(code)` call sites to handle `Promise<boolean>` return:
        `ShoppingConfidence`, `CustomerExtras` (customer-confidence.tsx), `HomeDeals` (commerce.tsx), `CouponInput` (shopping-ui.tsx).
        Files: `src/components/veloura/customer-confidence.tsx`, `src/components/veloura/commerce.tsx`, `src/components/veloura/shopping-ui.tsx`
        Verify: `npm run build`

- [ ] 7. Wire `CheckoutPage` payment methods to live `PaymentSettings` from `useSettings()`.
        Build `paymentMethods[]` from `cod_enabled`, `easypaisa_enabled`, `jazzcash_enabled`, `bank_enabled`.
        Show `payment_note` if set. Fall back to `['Cash on Delivery', 'Card — Demo', 'Online Payment — Demo']`.
        Files: `src/components/veloura/commerce.tsx`
        Verify: `npm run build`

---

## FEAT-003 — Live reviews display + review submission form on product detail page

**Files**: `src/components/veloura/shopping-ui.tsx`, `src/components/veloura/commerce.tsx`

- [ ] 8. Add `ReviewForm` component to `shopping-ui.tsx`: star selector, name/title/body inputs, calls `api.submitReview` via `useMutation`.
        Add `LiveReviews` component: calls `useReviews(productId)`, filters by productId client-side, renders blockquotes or static demo fallback.
        Add `useProductRating(productId, fallback)` helper that computes average from live reviews.
        Files: `src/components/veloura/shopping-ui.tsx`
        Verify: `npm run build`

- [ ] 9. Update `ProductDetailPage` reviews section in `commerce.tsx`:
        Replace static hardcoded review blockquotes with `<LiveReviews productId={product.id} fallbackCount={product.reviewCount} />`.
        Add `<ReviewForm productId={product.id} />` below the reviews list.
        Update `Rating` component to call `useReviews` and show live average + count when available.
        Files: `src/components/veloura/commerce.tsx`
        Verify: `npm run build`

---

## Build verification (final)

Run `npm run build` from `c:\Users\JalipEmpire\Downloads\New folder (9)\veloura-apparel-main`.
Zero TypeScript errors and zero Vite transform errors = pass.

End-to-end test:
1. Set `VITE_API_URL=http://localhost:8000` in `.env` (or `.env.local`).
2. Start backend: `cd backend && uvicorn app.main:app --reload --port 8000`.
3. Start frontend: `npm run dev`.
4. In admin (`http://localhost:8000/admin`): change `brand_tagline` → storefront navbar updates within 60s.
5. Submit a review on any product → appears in admin under Reviews → approve it → product page shows it within 30s.
6. Unset `VITE_API_URL`, restart dev server → storefront renders with all static fallback data, no errors.
