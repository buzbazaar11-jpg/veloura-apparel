# Veloura Backend (FastAPI)

Standalone backend + admin panel. FastAPI + SQLAlchemy + SQLite (local dev) / PostgreSQL (production).

## Quick Start — Local Development (Windows)

```powershell
# 1. Go into backend folder
cd backend

# 2. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. .env is already configured for SQLite (no Postgres needed locally)
#    To change settings, edit backend/.env

# 5. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be at: http://localhost:8000  
API docs: http://localhost:8000/docs  
Admin panel: http://localhost:8000/admin

## Connect Frontend to Backend

The storefront works offline by default. To connect it to the running backend,
the project root `.env` already has:

```
VITE_API_URL=http://localhost:8000
```

Run the frontend dev server in the project root (not backend/):
```powershell
npm run dev
```

## Database

- **Local dev:** SQLite (`veloura.db` is auto-created in `backend/` on first run)
- **Production:** PostgreSQL — change `DATABASE_URL` in `.env` to:
  ```
  DATABASE_URL=postgresql+psycopg2://user:password@host:5432/dbname
  ```

All 23 tables are created automatically on startup via `Base.metadata.create_all()`.

## Import Existing Data

```powershell
# From inside backend/ with venv active:
python -m scripts.import_json data_export
python -m scripts.create_admin admin@velouraapparel.store YourPassword
```

## Run on a VPS (Docker)

```bash
cp .env.example .env        # fill JWT_SECRET, PUBLIC_BASE_URL, CORS_ORIGINS, SMTP_*, META_*
docker compose up -d --build
docker compose exec api python -m scripts.import_json data_export
docker compose exec api python -m scripts.create_admin you@email.com YourPassword
```

Put Nginx/Caddy in front for HTTPS (proxy to port 8000, set `client_max_body_size 200M`).

## Project Structure

```
backend/
├── app/
│   ├── main.py          – app entry, mounts routers, /uploads, /admin
│   ├── models.py        – all 23 database tables
│   ├── core/
│   │   ├── config.py    – settings from .env
│   │   ├── database.py  – SQLAlchemy engine + session
│   │   ├── security.py  – JWT + bcrypt
│   │   └── utils.py     – helpers
│   ├── routers/
│   │   ├── public.py    – catalogue, settings, coupons
│   │   ├── auth.py      – signup, login, profile
│   │   ├── orders.py    – checkout + order tracking
│   │   ├── tracking.py  – analytics, cart leads, Meta CAPI bridge
│   │   └── admin.py     – full CRUD, stats, uploads
│   ├── services/
│   │   ├── email.py     – order emails via SMTP (skipped if SMTP_HOST empty)
│   │   └── meta.py      – Meta Conversions API (skipped if META_PIXEL_ID empty)
│   └── admin_panel/
│       └── index.html   – admin panel SPA served at /admin
├── data_export/         – products, orders, settings, images to import
├── scripts/             – import_json.py, create_admin.py
├── tests/               – automated tests
├── .env                 – local dev config (SQLite, not committed)
├── .env.example         – template for production config
├── requirements.txt     – Python dependencies
└── docker-compose.yml   – Postgres + API containers for production
```

## API Routes (prefix `/api/v1`)

**Public:**  
`GET /products`, `/products/{slug}`, `/collections`, `/categories`, `/hero-slides`,  
`/deals`, `/popups`, `/reviews`, `/blog`, `/blog/{slug}`, `/faqs`, `/trust`, `/settings`  
`POST /reviews`, `/coupons/validate`, `/health`

**Auth:**  
`POST /auth/signup`, `/auth/login` → `{token}`  
`GET /auth/session`, `GET|PUT /auth/profile` (header: `Authorization: Bearer <token>`)

**Orders:**  
`POST /orders` (prices recomputed server-side, `idempotency_key` prevents duplicates)  
`GET /orders/{number}?email=` or `?phone=`

**Tracking:**  
`POST /track/event`, `/track/lead`, `/track/meta`

**Admin** (admin/staff JWT required):  
`GET|POST /admin/r/{table}`, `PUT|DELETE /admin/r/{table}/{id}`  
`GET|PUT /admin/settings/{site_settings|payment_settings|meta_settings}`  
`GET /admin/orders`, `PATCH /admin/orders/{id}`, `POST /admin/orders/{id}/email`  
`GET /admin/stats`, `POST /admin/upload`, `GET /admin/users`, `POST /admin/users/{id}/role`

## Emails

Sent automatically when order is placed, and when admin sets status to  
confirmed / shipped / delivered / cancelled.  
Every email (sent or failed) appears in admin → "Emails sent".  
Requires `SMTP_HOST` in `.env`.

## Tests

```powershell
pytest -q
```
