#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# Veloura Apparel — Backend Deploy Script
# Run from the repository root: bash deploy/scripts/deploy-backend.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DEPLOY_DIR="/var/www/veloura-backend"
APP_USER="veloura"
SERVICE="veloura-backend"
REPO_BACKEND="$(pwd)/backend"

echo "==> Deploying backend to ${DEPLOY_DIR}"

# ── Backup current deployment ─────────────────────────────────────────────────
if [ -d "${DEPLOY_DIR}/app" ]; then
    echo "==> Creating backup..."
    BACKUP="${DEPLOY_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    cp -r "${DEPLOY_DIR}" "${BACKUP}"
    echo "    Backup at: ${BACKUP}"
fi

# ── Copy application files ────────────────────────────────────────────────────
echo "==> Copying backend files..."
rsync -av --exclude="venv" --exclude="*.pyc" --exclude="__pycache__" \
    --exclude="*.db" --exclude="uploads/" \
    "${REPO_BACKEND}/" "${DEPLOY_DIR}/"

chown -R "${APP_USER}:${APP_USER}" "${DEPLOY_DIR}"

# ── Create / update virtualenv ────────────────────────────────────────────────
echo "==> Installing Python dependencies..."
if [ ! -d "${DEPLOY_DIR}/venv" ]; then
    sudo -u "${APP_USER}" python3.11 -m venv "${DEPLOY_DIR}/venv"
fi
sudo -u "${APP_USER}" "${DEPLOY_DIR}/venv/bin/pip" install --upgrade pip
sudo -u "${APP_USER}" "${DEPLOY_DIR}/venv/bin/pip" install -r "${DEPLOY_DIR}/requirements.txt"
sudo -u "${APP_USER}" "${DEPLOY_DIR}/venv/bin/pip" install gunicorn

# ── Run database migrations ───────────────────────────────────────────────────
echo "==> Running database setup (create_all tables)..."
cd "${DEPLOY_DIR}"
sudo -u "${APP_USER}" "${DEPLOY_DIR}/venv/bin/python" -c \
    "from app.core.database import Base, engine; from app import models; Base.metadata.create_all(engine); print('Tables OK')"

# ── Restart service ───────────────────────────────────────────────────────────
echo "==> Restarting ${SERVICE}..."
if systemctl is-active --quiet "${SERVICE}"; then
    systemctl restart "${SERVICE}"
else
    # First time install
    cp "$(pwd)/deploy/systemd/veloura-backend.service" /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable "${SERVICE}"
    systemctl start  "${SERVICE}"
fi

sleep 3
systemctl status "${SERVICE}" --no-pager

# ── Health check ──────────────────────────────────────────────────────────────
echo "==> Health check..."
for i in {1..10}; do
    if curl -sf http://127.0.0.1:8000/api/v1/health > /dev/null; then
        echo "✅  Backend healthy"
        break
    fi
    echo "    Waiting... (${i}/10)"
    sleep 2
done

echo ""
echo "✅  Backend deployed successfully!"
