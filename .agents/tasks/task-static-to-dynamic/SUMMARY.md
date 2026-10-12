# Task: Static to Dynamic — Completed

## What Was Built

The Veloura storefront was wired from fully static/hardcoded data to a live FastAPI + SQLite/PostgreSQL backend. Every editable piece of content now flows through REST endpoints so that admin changes appear on the storefront instantly, customer actions (reviews, orders) appear in the admin panel instantly, and all data persists to the database.

### Backend (`/backend`)

| File | Purpose |
|---|---|
| `app/main.py` | FastAPI entry point with CORS, route mounts, DB init |
| `app/models.py` | SQLAlchemy models: SiteSettings, HeroSlide, BlogPost, Coupon, Review, Order, Product, Category, Deal, FAQ, Popup, TrustSection, CartLead, PaymentSettings |
| `app/core/config.py` | Pydantic Settings — reads `.env` |
| `app/core/database.py` | Async SQLAlchemy engine + session factory |
| `app/core/security.py` | JWT auth helpers (login, token verify) |
| `app/routers/auth.py` | `POST /auth/login` |
| `app/routers/admin.py` | Admin CRUD endpoints for all content types |
| `app/routers/public.py` | Public read-only endpoints (hero, blog, coupons, reviews, products …) |
| `app/routers/orders.py` | Order placement (`POST /orders`) and retrieval |
| `app/routers/tracking.py` | Order tracking by code |
| `app/services/email.py` | Optional transactional email via SMTP |
| `app/services/meta.py` | Open Graph / meta-tag helpers |
| `scripts/create_admin.py` | One-time admin user seeding script |
| `scripts/import_json.py` | Seed DB from `data_export/*.json` snapshots |
| `requirements.txt` | Pinned Python deps |
| `.env` | Credentials (edit before starting) |

### Frontend (`/src`)

| File | Purpose |
|---|---|
| `src/lib/api.ts` | All typed fetch helpers; offline-first — falls back to static data when `VITE_API_URL` is not set |
| `src/lib/live-catalog.tsx` | React Query hooks: `useHeroSlides`, `useBlogPosts`, `useCoupons`, `useSiteSettings`, `useReviews`, `useProductRating`, `useProducts`, `useCategories`, `useDeals`, `useFAQs`, `usePopups`, `useTrustSections` |
| `src/lib/veloura-store.tsx` | Cart store wired to `POST /cart-leads` and `POST /orders` |
| `src/components/veloura/customer-confidence.tsx` | Trust/offer overlays pull from `useTrustSections` hook |
| `src/routes/index.tsx` | Hero, deals and blog now read from React Query hooks |
| `src/routes/product.$slug.tsx` | Product page includes `ReviewForm` and `LiveReviews` |

## Files Changed (key list)

```
backend/app/main.py
backend/app/models.py
backend/app/core/config.py
backend/app/core/database.py
backend/app/core/security.py
backend/app/routers/auth.py
backend/app/routers/admin.py
backend/app/routers/public.py
backend/app/routers/orders.py
backend/app/routers/tracking.py
backend/app/services/email.py
backend/requirements.txt
backend/.env
src/lib/api.ts
src/lib/live-catalog.tsx
src/lib/veloura-store.tsx
src/components/veloura/customer-confidence.tsx
src/routes/index.tsx
src/routes/product.$slug.tsx
```

## How to Test

### 1. Configure credentials

Edit `backend/.env` and set at minimum:

```env
SECRET_KEY=your-random-secret-key
DATABASE_URL=sqlite+aiosqlite:///./veloura.db
ADMIN_EMAIL=admin@veloura.com
ADMIN_PASSWORD=your-password
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
python scripts/create_admin.py          # seed admin user once
python scripts/import_json.py           # optional: seed data from JSON exports
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### 3. Start the frontend

```bash
# in project root
VITE_API_URL=http://localhost:8000 npm run dev
```

On Windows (PowerShell):

```powershell
$env:VITE_API_URL="http://localhost:8000"; npm run dev
```

### 4. Admin panel

Visit `http://localhost:5173/admin` (or whatever port Vite picks) and log in with the credentials you set in `.env`. Changes made in the admin panel persist to the DB and are immediately reflected on the public storefront.

### 5. Offline / static fallback

Omit `VITE_API_URL` (or leave it unset) and the storefront runs on its built-in static data — no backend required.

## Commits

```
cc876e3  feat: add live reviews, ReviewForm, and LiveReviews to product detail page (FEAT-003)
ba39fbd  feat: wire coupon, payment settings and shipping to backend (FEAT-002)
f6d30ee  feat: add React Query hooks and wire static-to-dynamic data layer (FEAT-001)
```
