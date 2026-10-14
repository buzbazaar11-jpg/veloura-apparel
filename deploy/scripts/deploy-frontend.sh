#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# Veloura Apparel — Frontend Deploy Script
# Build locally then upload to VPS, OR run on VPS directly.
#
# Usage (from repo root on VPS):
#   bash deploy/scripts/deploy-frontend.sh
#
# Usage (from local machine — requires sshpass or SSH key):
#   REMOTE_HOST=root@your-vps-ip bash deploy/scripts/deploy-frontend.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DEPLOY_DIR="/var/www/veloura-frontend"
APP_USER="veloura"
SERVICE="veloura-frontend"
REPO_ROOT="$(pwd)"

echo "==> Building frontend..."

# ── Ensure .env has required vars ─────────────────────────────────────────────
if [ ! -f "${REPO_ROOT}/.env.production" ]; then
    echo "ERROR: .env.production not found. Copy .env.production.example and fill in values."
    exit 1
fi

# Export production env for the build
set -a; source "${REPO_ROOT}/.env.production"; set +a

# ── Install deps if needed ────────────────────────────────────────────────────
echo "==> Installing npm dependencies..."
npm ci --omit=dev

# ── Build ─────────────────────────────────────────────────────────────────────
echo "==> Running production build..."
NODE_ENV=production npm run build

echo "==> Build output:"
ls -lh .output/server/index.mjs || { echo "ERROR: Build output not found!"; exit 1; }

# ── Backup current deployment ─────────────────────────────────────────────────
if [ -d "${DEPLOY_DIR}/.output" ]; then
    echo "==> Creating backup..."
    BACKUP="${DEPLOY_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    cp -r "${DEPLOY_DIR}" "${BACKUP}" 2>/dev/null || true
    echo "    Backup at: ${BACKUP}"
fi

# ── Deploy output ─────────────────────────────────────────────────────────────
echo "==> Deploying to ${DEPLOY_DIR}..."
mkdir -p "${DEPLOY_DIR}"
rsync -av --delete .output/ "${DEPLOY_DIR}/.output/"
chown -R "${APP_USER}:${APP_USER}" "${DEPLOY_DIR}"

# ── Restart service ───────────────────────────────────────────────────────────
echo "==> Restarting ${SERVICE}..."
if systemctl is-active --quiet "${SERVICE}"; then
    systemctl restart "${SERVICE}"
else
    cp "${REPO_ROOT}/deploy/systemd/veloura-frontend.service" /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable "${SERVICE}"
    systemctl start  "${SERVICE}"
fi

sleep 3
systemctl status "${SERVICE}" --no-pager

# ── Health check ──────────────────────────────────────────────────────────────
echo "==> Health check..."
for i in {1..10}; do
    HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "000")
    if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "301" ] || [ "${HTTP_CODE}" = "302" ]; then
        echo "✅  Frontend healthy (HTTP ${HTTP_CODE})"
        break
    fi
    echo "    Waiting... ${HTTP_CODE} (${i}/10)"
    sleep 2
done

echo ""
echo "✅  Frontend deployed successfully!"
