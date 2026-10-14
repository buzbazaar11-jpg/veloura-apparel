# Veloura Apparel — Production Deployment Guide

## Architecture

```
User → Nginx (HTTPS) → Frontend SSR (Node, port 3000)
User → Nginx (HTTPS) → Backend API  (Gunicorn+uvicorn, port 8000)
Backend → Supabase PostgreSQL (Singapore pool)
Admin uploads → Cloudinary (optional) or /uploads/ on disk
```

| Service | URL | Port |
|---------|-----|------|
| Frontend (SSR) | https://yourdomain.com | 3000 (internal) |
| Backend API | https://api.yourdomain.com | 8000 (internal) |
| Admin panel | https://api.yourdomain.com/admin | — |
| Supabase DB | Supabase cloud | 6543 (pooler) |

---

## Requirements

- Hostinger KVM 2 VPS (Ubuntu 22.04 LTS)
- Domain with DNS control
- Node.js 20 LTS
- Python 3.11
- Nginx
- Certbot (Let's Encrypt)

---

## 1. First-Time VPS Setup

```bash
# As root — replace domain and email
sudo bash deploy/scripts/setup-vps.sh yourdomain.com admin@yourdomain.com
```

This installs Node 20, Python 3.11, Nginx, Certbot, creates the `veloura`
system user, directories, and obtains TLS certificates.

---

## 2. DNS Records

Add these records in your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ (or yourdomain.com) | YOUR_VPS_IP |
| A | www | YOUR_VPS_IP |
| A | api | YOUR_VPS_IP |

Wait for DNS propagation (5–60 minutes) before obtaining TLS certificates.

---

## 3. Nginx Configuration

```bash
# Copy config files
sudo cp deploy/nginx/frontend.conf /etc/nginx/sites-available/veloura-frontend
sudo cp deploy/nginx/backend.conf  /etc/nginx/sites-available/veloura-backend

# Edit both files — replace yourdomain.com with your actual domain
sudo nano /etc/nginx/sites-available/veloura-frontend
sudo nano /etc/nginx/sites-available/veloura-backend

# Enable sites
sudo ln -sf /etc/nginx/sites-available/veloura-frontend /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/veloura-backend  /etc/nginx/sites-enabled/

# Remove default site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test config — ALWAYS do this before reloading
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## 4. Environment Variables

### Backend
```bash
sudo nano /etc/veloura/backend.env
# Fill in values from deploy/backend.env.example
sudo chmod 600 /etc/veloura/backend.env
sudo chown root:veloura /etc/veloura/backend.env
```

### Frontend
```bash
sudo nano /etc/veloura/frontend.env
# Contents:
# NODE_ENV=production
# PORT=3000
# HOST=127.0.0.1
# VITE_API_URL=https://api.yourdomain.com
sudo chmod 600 /etc/veloura/frontend.env
sudo chown root:veloura /etc/veloura/frontend.env
```

Also create `.env.production` in the repo root (for build):
```bash
cp .env.production.example .env.production
nano .env.production
# Set VITE_API_URL=https://api.yourdomain.com
```

---

## 5. Deploy Backend

```bash
# From repo root on the VPS (as a user with sudo)
sudo bash deploy/scripts/deploy-backend.sh
```

Manual steps if needed:
```bash
# Copy backend files
sudo rsync -av --exclude="venv" --exclude="*.pyc" backend/ /var/www/veloura-backend/
sudo chown -R veloura:veloura /var/www/veloura-backend

# Create virtualenv and install deps
sudo -u veloura python3.11 -m venv /var/www/veloura-backend/venv
sudo -u veloura /var/www/veloura-backend/venv/bin/pip install -r /var/www/veloura-backend/requirements.txt
sudo -u veloura /var/www/veloura-backend/venv/bin/pip install gunicorn

# Run DB setup
cd /var/www/veloura-backend
sudo -u veloura venv/bin/python -c \
  "from app.core.database import Base, engine; from app import models; Base.metadata.create_all(engine); print('OK')"

# Start service
sudo cp deploy/systemd/veloura-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable veloura-backend
sudo systemctl start  veloura-backend
sudo systemctl status veloura-backend
```

---

## 6. Deploy Frontend

```bash
# From repo root (builds locally, deploys output)
sudo bash deploy/scripts/deploy-frontend.sh
```

Manual steps:
```bash
# Build (with production env)
set -a; source .env.production; set +a
NODE_ENV=production npm run build

# Deploy output
sudo rsync -av .output/ /var/www/veloura-frontend/.output/
sudo chown -R veloura:veloura /var/www/veloura-frontend

# Start service
sudo cp deploy/systemd/veloura-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable veloura-frontend
sudo systemctl start  veloura-frontend
sudo systemctl status veloura-frontend
```

---

## 7. Create Admin User

```bash
cd /var/www/veloura-backend
source /etc/veloura/backend.env
sudo -u veloura venv/bin/python -m scripts.create_admin admin@yourdomain.com 'StrongPassword123!'
```

---

## 8. Verify Everything

```bash
sudo bash deploy/scripts/health-check.sh yourdomain.com
```

Manual checks:
```bash
# Service status
sudo systemctl status veloura-frontend veloura-backend nginx

# Logs
sudo journalctl -u veloura-backend  -n 50 --no-pager
sudo journalctl -u veloura-frontend -n 50 --no-pager
tail -f /var/log/veloura/backend-error.log

# API health
curl https://api.yourdomain.com/api/v1/health

# Frontend
curl -I https://yourdomain.com/
```

---

## 9. Subsequent Deployments (Rolling Update)

```bash
# Pull latest code
git pull

# Backend update
sudo bash deploy/scripts/deploy-backend.sh

# Frontend update (rebuild + restart)
sudo bash deploy/scripts/deploy-frontend.sh
```

---

## 10. Rollback

```bash
# Find backup
ls /var/www/veloura-backend_backup_*
ls /var/www/veloura-frontend_backup_*

# Restore backend
sudo rsync -av /var/www/veloura-backend_backup_TIMESTAMP/ /var/www/veloura-backend/
sudo systemctl restart veloura-backend

# Restore frontend
sudo rsync -av /var/www/veloura-frontend_backup_TIMESTAMP/ /var/www/veloura-frontend/
sudo systemctl restart veloura-frontend
```

---

## 11. Supabase Performance

The backend connects to Supabase via the **connection pooler** (port 6543,
PgBouncer transaction mode). This limits each request to borrow a connection
from the pool rather than holding it open, staying within Supabase's
connection limits.

```
# Check VPS → Supabase latency
ping aws-0-ap-northeast-1.pooler.supabase.com

# If latency > 200ms, consider migrating to a Singapore region project:
# Supabase Dashboard → Settings → General → Region → Southeast Asia (Singapore)
# This reduces RTT from ~200ms (Japan) to ~80ms for Pakistan users
```

Useful indexes (add in Supabase SQL Editor if queries are slow):
```sql
-- Products: most common query patterns
CREATE INDEX IF NOT EXISTS idx_products_active_sort   ON products (active, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival   ON products (new_arrival, active);
CREATE INDEX IF NOT EXISTS idx_products_featured      ON products (featured, active);
CREATE INDEX IF NOT EXISTS idx_products_category      ON products (category, active);
CREATE INDEX IF NOT EXISTS idx_products_slug          ON products (slug);

-- Orders: admin dashboard
CREATE INDEX IF NOT EXISTS idx_orders_status_created  ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number          ON orders (order_number);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_event_name   ON analytics_events (event_name, created_at DESC);
```

---

## 12. Performance Baseline

After fixing 1-second polling (previous issue):

| Metric | Before | After |
|--------|--------|-------|
| API requests/min (homepage) | ~600 | ~5-10 |
| React re-renders/min | ~600 | ~5-10 |
| staleTime | 0ms | 30s–5min |
| refetchInterval | 1s | 30s–2min |
| Background tab polling | Yes | Disabled |
| Window focus refetch | Yes | Disabled |
| Order tracking poll | 1s | 10s |
| Deals live poll | 1s | 2min |

---

## Files Created/Modified

| File | Purpose |
|------|---------|
| `src/router.tsx` | QueryClient with production defaults, `defaultPreloadStaleTime: 60s` |
| `src/lib/api.ts` | All hooks use tiered caching (30s/60s/2min/5min) |
| `src/lib/live-catalog.tsx` | Deals poll: 1s → 2min |
| `src/components/veloura/commerce.tsx` | Order tracking: 1s → 10s |
| `src/routes/__root.tsx` | Google Fonts: trimmed weights, kept display=swap |
| `deploy/nginx/frontend.conf` | Nginx SSR proxy for frontend |
| `deploy/nginx/backend.conf` | Nginx reverse proxy for FastAPI |
| `deploy/systemd/veloura-backend.service` | Gunicorn service unit |
| `deploy/systemd/veloura-frontend.service` | Node SSR service unit |
| `deploy/scripts/setup-vps.sh` | One-time VPS setup |
| `deploy/scripts/deploy-backend.sh` | Backend deploy automation |
| `deploy/scripts/deploy-frontend.sh` | Frontend build + deploy |
| `deploy/scripts/health-check.sh` | Post-deploy verification |
| `.env.production.example` | Frontend env template |
| `deploy/backend.env.example` | Backend env template |
