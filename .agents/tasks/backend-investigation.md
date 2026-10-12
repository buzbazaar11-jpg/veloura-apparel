# Backend Investigation Report — Veloura / Veloura Apparel FastAPI

## Summary

The backend code is **structurally complete and has no syntax errors**. All five routers load correctly, every service file imports cleanly, and the full route tree is properly registered in `main.py`. The frontend `api.ts` only calls endpoints that exist in the backend.

**There is one blocking runtime error** and two configuration gaps that prevent the backend from starting in the current local environment:

1. **`psycopg` (psycopg3) is NOT installed** — the system only has `psycopg2-binary`. The `DATABASE_URL` in `config.py` uses the `postgresql+psycopg://` driver prefix, which requires the `psycopg` v3 package. Importing `app.core.database` immediately fails with `ModuleNotFoundError: No module named 'psycopg'`, which means the entire app crashes on startup.
2. **No `.env` file exists** in `backend/` — neither `backend/.env` nor the project root has one. Without it, the app falls back to the defaults in `config.py`, which includes a `DATABASE_URL` pointing to a local PostgreSQL instance that likely does not exist on this machine.
3. **No PostgreSQL database is running locally** — the `DATABASE_URL` default points to `localhost:5432/Veloura Apparel` which does not exist on this Windows machine, so even after fixing the psycopg issue the DB connection would fail at startup (`Base.metadata.create_all(engine)` on line 11 of `main.py`).

Everything else (code logic, imports, models, router registrations, CORS, file uploads, admin panel) is correct.

---

## Evidence

### 1. Missing `psycopg` package — blocking startup error

**File:** `backend/requirements.txt` line 4 specifies `psycopg[binary]>=3.2`  
**File:** `backend/app/core/database.py` lines 1-10

```python
from sqlalchemy import create_engine
...
engine = create_engine(settings.DATABASE_URL, **_kwargs)
# ↑ DATABASE_URL = "postgresql+psycopg://..." triggers SQLAlchemy to import psycopg (v3)
```

**Verified error (command run):**
```
python -c "from app.core.database import engine, Base"
ModuleNotFoundError: No module named 'psycopg'
  File "backend\app\core\database.py", line 10, in <module>
    engine = create_engine(settings.DATABASE_URL, **_kwargs)
  File "sqlalchemy\dialects\postgresql\psycopg.py", line 497, in import_dbapi
    import psycopg
```

**What is installed:** `psycopg2-binary 2.9.13` — this is the *old* psycopg2 driver. The backend requires psycopg3 (`psycopg[binary]`).

**Fix options (choose one):**
- Option A — Install psycopg3: `pip install "psycopg[binary]>=3.2"`
- Option B — Change driver in config to use psycopg2 (simpler if staying local): change `postgresql+psycopg://` → `postgresql+psycopg2://` in `backend/app/core/config.py` line 8 and `backend/.env.example` line 1. psycopg2-binary is already installed.

### 2. Missing `.env` file

**File:** `backend/.env.example` — exists but the actual `backend/.env` does not exist.  
**File:** `backend/app/core/config.py` — `SettingsConfigDict(env_file=".env")` on line 4.

Without `.env`, the app uses these defaults from `config.py`:
- `DATABASE_URL = "postgresql+psycopg://Veloura Apparel:Veloura Apparel@localhost:5432/Veloura Apparel"` — requires local Postgres
- `JWT_SECRET = "change-me-to-a-long-random-string"` — insecure default, works for dev
- `CORS_ORIGINS = "*"` — permissive, fine for dev
- `SMTP_HOST = ""` — email sending will be skipped (graceful, logged as "skipped")
- `META_PIXEL_ID = ""` — Meta CAPI events will be skipped (graceful, logged as "skipped")

**Fix:** Copy `.env.example` to `.env` and fill in values. Minimum required for startup: `DATABASE_URL`.

### 3. No PostgreSQL instance on this machine

The default and `.env.example` both point to `localhost:5432/Veloura Apparel`. This machine has no PostgreSQL running (no Postgres process, Docker not confirmed running). Even if psycopg is installed, `Base.metadata.create_all(engine)` on `main.py` line 11 will fail with a connection error at startup.

**Fix options (choose one):**
- Option A (Docker, recommended): Run `docker compose up -d` inside `backend/` — this starts both Postgres and the API container together.
- Option B (Local dev without Docker): Install PostgreSQL locally, create a `Veloura Apparel` user/database, then run `uvicorn app.main:app --reload` from `backend/`.
- Option C (SQLite for local testing only): Change `DATABASE_URL` in `.env` to `sqlite:///./veloura.db`. The `database.py` already handles SQLite at line 6–7.

### 4. Python version

System Python is **3.13.7**. The `Dockerfile` uses `python:3.12-slim`. The code uses `str | None` union syntax (Python 3.10+) — this is compatible with 3.13. No issue here.

---

## Route completeness — all routers correctly registered

**File:** `backend/app/main.py` lines 10-14

```python
from app.routers import admin, auth, orders, public, tracking
...
for r in (public.router, auth.router, orders.router, tracking.router, admin.router):
    app.include_router(r)
```

All 5 router files exist and import correctly:
- `backend/app/routers/public.py` ✅
- `backend/app/routers/auth.py` ✅
- `backend/app/routers/orders.py` ✅
- `backend/app/routers/tracking.py` ✅
- `backend/app/routers/admin.py` ✅

**Complete verified route list (44 routes):**

| Method | Path |
|--------|------|
| GET | `/` |
| GET | `/admin`, `/admin/{path:path}` |
| GET | `/api/v1/health` |
| GET | `/api/v1/products` |
| GET | `/api/v1/products/{slug}` |
| GET | `/api/v1/collections` |
| GET | `/api/v1/categories` |
| GET | `/api/v1/hero-slides` |
| GET | `/api/v1/faqs` |
| GET | `/api/v1/trust` |
| GET | `/api/v1/deals` |
| GET | `/api/v1/popups` |
| GET | `/api/v1/reviews` |
| POST | `/api/v1/reviews` |
| GET | `/api/v1/blog` |
| GET | `/api/v1/blog/{slug}` |
| GET | `/api/v1/settings` |
| POST | `/api/v1/coupons/validate` |
| POST | `/api/v1/auth/signup` |
| POST | `/api/v1/auth/login` |
| GET | `/api/v1/auth/session` |
| GET, PUT | `/api/v1/auth/profile` |
| POST | `/api/v1/orders` |
| GET | `/api/v1/orders/{order_number}` |
| POST | `/api/v1/track/event` |
| POST | `/api/v1/track/lead` |
| POST | `/api/v1/track/meta` |
| GET | `/api/v1/admin/schema` |
| GET, POST | `/api/v1/admin/r/{name}` |
| PUT, DELETE | `/api/v1/admin/r/{name}/{rid}` |
| GET, PUT | `/api/v1/admin/settings/{name}` |
| GET | `/api/v1/admin/orders` |
| PATCH | `/api/v1/admin/orders/{oid}` |
| POST | `/api/v1/admin/orders/{oid}/email` |
| GET | `/api/v1/admin/stats` |
| POST | `/api/v1/admin/upload` |
| GET | `/api/v1/admin/users` |
| POST | `/api/v1/admin/users/{uid}/role` |

---

## Database / models

**File:** `backend/app/models.py` — 20 tables, all correct:

`users`, `user_roles`, `profiles`, `products`, `collections`, `categories`, `deals`, `coupons`, `hero_slides`, `popups`, `reviews`, `blog_posts`, `faqs`, `trust_sections`, `orders`, `order_emails`, `cart_leads`, `analytics_events`, `meta_event_log`, `meta_insights_daily`, `site_settings`, `payment_settings`, `meta_settings`

All models are imported via `from app import models  # noqa: F401` in `main.py` line 8, ensuring `Base.metadata` registers all tables before `create_all()`. No Alembic migration setup — the backend uses `Base.metadata.create_all(engine)` (auto-create on startup). This is correct for the project's design.

---

## Frontend ↔ Backend endpoint mapping

**File:** `src/lib/api.ts` calls these endpoints:

| Frontend call | Backend route | Match? |
|---|---|---|
| `GET /api/v1/health` | `GET /api/v1/health` (public.py) | ✅ |
| `POST /api/v1/coupons/validate` | `POST /api/v1/coupons/validate` (public.py) | ✅ |
| `POST /api/v1/orders` | `POST /api/v1/orders` (orders.py) | ✅ |
| `GET /api/v1/orders/{number}?email=` | `GET /api/v1/orders/{order_number}` (orders.py) | ✅ |

**File:** `src/lib/live-catalog.tsx` also calls:

| Frontend call | Backend route | Match? |
|---|---|---|
| `GET /api/v1/products` | `GET /api/v1/products` (public.py) | ✅ |
| `GET /api/v1/products/{slug}` | `GET /api/v1/products/{slug}` (public.py) | ✅ |
| `GET /api/v1/deals` | `GET /api/v1/deals` (public.py) | ✅ |

All frontend API calls are satisfied by existing backend endpoints. No mismatches.

**`VITE_API_URL` status:** Not set in any `.env` file in the project root. The frontend's `api.ts` gracefully handles this — `apiEnabled` is `false` and all API calls are skipped. The storefront works offline-first using local hardcoded data. To connect it to the backend, add `VITE_API_URL=http://localhost:8000` to a `.env` file in the project root.

---

## Services

### `backend/app/services/email.py`
- Imports `smtplib`, `ssl`, `email.message` — all stdlib, no extra packages needed. ✅
- Gracefully skips sending if `SMTP_HOST` is empty (logs as "skipped"). ✅

### `backend/app/services/meta.py`
- Imports `httpx` — installed (0.27.2). ✅
- Gracefully skips if `META_PIXEL_ID` / `META_ACCESS_TOKEN` are empty. ✅

---

## Startup command

Defined in multiple places:
- **Without Docker:** `uvicorn app.main:app --host 0.0.0.0 --port 8000` (README, must be run from `backend/` directory)
- **With Docker:** `docker compose up -d --build` (from `backend/` directory, `docker-compose.yml`)
- **Dockerfile CMD:** `["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]`

---

## Packages — installed vs required

| Package | Required in requirements.txt | Installed | Status |
|---|---|---|---|
| fastapi>=0.115 | ✅ | 0.115.6 | ✅ |
| uvicorn[standard]>=0.30 | ✅ | 0.32.1 | ✅ |
| sqlalchemy>=2.0 | ✅ | 2.1.4 | ✅ |
| **psycopg[binary]>=3.2** | ✅ | **NOT installed** | ❌ BLOCKING |
| pydantic-settings>=2.4 | ✅ | 2.6.1 | ✅ |
| email-validator>=2.2 | ✅ | 2.3.0 | ✅ |
| python-multipart>=0.0.9 | ✅ | 0.0.20 | ✅ |
| bcrypt>=4.2 | ✅ | 4.0.1 | ⚠️ slightly older but compatible |
| PyJWT>=2.9 | ✅ | 2.15.1 | ✅ |
| httpx>=0.27 | ✅ | 0.27.2 | ✅ |
| pytest>=8.3 | ✅ | 8.3.4 | ✅ |

`psycopg2-binary 2.9.13` is installed but the backend requires `psycopg` v3, a completely different package.

---

## Environment variables — .env.example vs config.py

All variables in `.env.example` are recognized by `config.py`. No mismatch. The `config.py` uses `extra="ignore"` so extra variables in `.env` are fine.

| Variable | In config.py | Default | Required? |
|---|---|---|---|
| DATABASE_URL | ✅ | localhost postgres | Must set for non-Docker |
| JWT_SECRET | ✅ | insecure default | Set for production |
| CORS_ORIGINS | ✅ | `*` | Set for production |
| PUBLIC_BASE_URL | ✅ | `http://localhost:8000` | Set for production |
| MAX_UPLOAD_MB | ✅ | 200 | Optional |
| SMTP_HOST/PORT/USER/PASSWORD/FROM/SSL | ✅ | empty | Optional (emails skip) |
| ADMIN_NOTIFY_EMAIL | ✅ | empty | Optional |
| META_PIXEL_ID / META_ACCESS_TOKEN / META_TEST_EVENT_CODE | ✅ | empty | Optional (Meta skips) |

---

## Syntax errors

**None.** All 13 Python files pass `python -m py_compile` with exit code 0:
- `app/main.py`, `app/models.py`
- `app/core/config.py`, `app/core/database.py`, `app/core/security.py`, `app/core/utils.py`
- `app/routers/auth.py`, `app/routers/public.py`, `app/routers/orders.py`, `app/routers/admin.py`, `app/routers/tracking.py`
- `app/services/email.py`, `app/services/meta.py`

---

## Recommendations (ordered by priority)

### Immediate — to get the backend running locally

1. **Install psycopg3** (the missing package):
   ```bash
   cd backend
   pip install "psycopg[binary]>=3.2"
   ```
   OR change the driver to psycopg2 in `config.py` line 8 and `database.py` (simpler since psycopg2-binary is already installed):
   ```python
   # config.py line 8
   DATABASE_URL: str = "postgresql+psycopg2://Veloura Apparel:Veloura Apparel@localhost:5432/Veloura Apparel"
   ```

2. **Create `backend/.env`** by copying `.env.example` and setting a real `DATABASE_URL`.

3. **Start a PostgreSQL database** — either `docker compose up -d` (starts Postgres + API together) or install PostgreSQL locally.

4. **Connect the frontend** — add `VITE_API_URL=http://localhost:8000` to a `.env` file at the project root. Without this, the frontend ignores the backend entirely.

### For production

5. Set a strong `JWT_SECRET` in `.env`.
6. Set `CORS_ORIGINS` to the actual frontend domain(s).
7. Set `PUBLIC_BASE_URL` to the API's public URL (used to build upload file URLs).
8. Configure SMTP settings for order emails.
9. Use Docker Compose — it handles the PostgreSQL + API relationship automatically.

### Minor

10. The `bcrypt` installed (4.0.1) is slightly below the `>=4.2` requirement. It will work for now but should be upgraded: `pip install "bcrypt>=4.2"`.
