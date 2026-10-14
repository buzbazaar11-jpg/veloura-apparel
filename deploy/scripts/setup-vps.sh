#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# Veloura Apparel — VPS Initial Setup Script
# Run once as root on a fresh Hostinger KVM 2 (Ubuntu 22.04 LTS)
# Usage: sudo bash setup-vps.sh yourdomain.com your-email@example.com
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> <email>}"
EMAIL="${2:?Usage: $0 <domain> <email>}"
APP_USER="veloura"
NODE_VERSION="20"  # LTS

echo "==> [1/10] Update system packages"
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git unzip software-properties-common ufw fail2ban

echo "==> [2/10] Configure firewall"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh        # Port 22
ufw allow 80/tcp     # HTTP (redirects to HTTPS)
ufw allow 443/tcp    # HTTPS
ufw --force enable
echo "Firewall status:"; ufw status

echo "==> [3/10] Harden SSH"
# Disable root password login (key auth only)
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl reload sshd
echo "SSH: password auth disabled, root login requires key"

echo "==> [4/10] Configure fail2ban"
systemctl enable --now fail2ban

echo "==> [5/10] Install Node.js ${NODE_VERSION}"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs
echo "Node: $(node --version), npm: $(npm --version)"

echo "==> [6/10] Install Python 3.11 + pip + venv"
add-apt-repository -y ppa:deadsnakes/ppa
apt-get update -y
apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip
python3.11 --version

echo "==> [7/10] Install Nginx + Certbot"
apt-get install -y nginx certbot python3-certbot-nginx
systemctl enable --now nginx
echo "Nginx: $(nginx -v 2>&1)"

echo "==> [8/10] Create application user and directories"
id "${APP_USER}" &>/dev/null || useradd --system --shell /bin/bash --create-home "${APP_USER}"

mkdir -p /var/www/veloura-frontend
mkdir -p /var/www/veloura-backend
mkdir -p /var/log/veloura
mkdir -p /etc/veloura

chown -R "${APP_USER}:${APP_USER}" /var/www/veloura-frontend /var/www/veloura-backend /var/log/veloura
chmod 750 /etc/veloura  # Secrets directory — root-owned, readable by app

echo "==> [9/10] Install Gunicorn (Python process manager for FastAPI)"
pip3 install gunicorn

echo "==> [10/10] Obtain TLS certificates"
certbot --nginx \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}" \
    -d "api.${DOMAIN}" \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    --redirect

# Auto-renewal
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && nginx -s reload") | crontab -

echo ""
echo "✅  VPS setup complete!"
echo ""
echo "Next steps:"
echo "  1. Copy deploy/nginx/frontend.conf → /etc/nginx/sites-available/veloura-frontend"
echo "     and backend.conf → /etc/nginx/sites-available/veloura-backend"
echo "  2. ln -s both into /etc/nginx/sites-enabled/"
echo "  3. Create /etc/veloura/frontend.env and /etc/veloura/backend.env"
echo "  4. Run deploy-backend.sh and deploy-frontend.sh"
echo "  5. Enable and start systemd services"
echo ""
echo "See DEPLOYMENT.md for full instructions."
