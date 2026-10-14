#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# Veloura Apparel — Health Check Script
# Usage: bash deploy/scripts/health-check.sh [domain]
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${1:-yourdomain.com}"
PASS=0; FAIL=0

check() {
    local name="$1"; local cmd="$2"
    if eval "${cmd}" &>/dev/null; then
        echo "✅  ${name}"
        PASS=$((PASS + 1))
    else
        echo "❌  ${name}"
        FAIL=$((FAIL + 1))
    fi
}

checkhttp() {
    local name="$1"; local url="$2"; local expected="${3:-200}"
    local code; code=$(curl -sL --max-time 10 -o /dev/null -w "%{http_code}" "${url}" 2>/dev/null || echo "000")
    if [ "${code}" = "${expected}" ] || { [ "${expected}" = "200" ] && [ "${code}" = "301" ]; }; then
        echo "✅  ${name} (HTTP ${code})"
        PASS=$((PASS + 1))
    else
        echo "❌  ${name} (HTTP ${code}, expected ${expected})"
        FAIL=$((FAIL + 1))
    fi
}

echo "═══════════════════════════════════════════"
echo " Veloura Apparel — Health Check"
echo " Domain: ${DOMAIN}"
echo "═══════════════════════════════════════════"
echo ""
echo "── Services ────────────────────────────────"
check "Nginx running"           "systemctl is-active nginx"
check "Frontend service running" "systemctl is-active veloura-frontend"
check "Backend service running"  "systemctl is-active veloura-backend"
echo ""
echo "── Local endpoints ─────────────────────────"
checkhttp "Frontend (local)"      "http://127.0.0.1:3000/"
checkhttp "Backend API (local)"   "http://127.0.0.1:8000/api/v1/health"
checkhttp "Backend admin (local)" "http://127.0.0.1:8000/admin" "200"
echo ""
echo "── Public HTTPS ─────────────────────────────"
checkhttp "Frontend HTTPS"   "https://${DOMAIN}/"
checkhttp "API HTTPS health" "https://api.${DOMAIN}/api/v1/health"
echo ""
echo "── Supabase connectivity ────────────────────"
check "Backend DB query (products)" \
    "curl -sf http://127.0.0.1:8000/api/v1/products | python3 -c 'import sys,json; d=json.load(sys.stdin); exit(0 if d.get(\"ok\") else 1)'"
echo ""
echo "── TLS certificates ─────────────────────────"
check "Frontend cert valid" \
    "openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} < /dev/null 2>/dev/null | openssl x509 -noout -checkend 604800"
check "API cert valid" \
    "openssl s_client -connect api.${DOMAIN}:443 -servername api.${DOMAIN} < /dev/null 2>/dev/null | openssl x509 -noout -checkend 604800"
echo ""
echo "── Recent errors (last 20 lines) ───────────"
echo "Frontend:"
tail -20 /var/log/veloura/frontend-error.log 2>/dev/null || echo "(no log file yet)"
echo ""
echo "Backend:"
tail -20 /var/log/veloura/backend-error.log 2>/dev/null || echo "(no log file yet)"
echo ""
echo "═══════════════════════════════════════════"
echo " Results: ${PASS} passed, ${FAIL} failed"
echo "═══════════════════════════════════════════"
[ "${FAIL}" = "0" ] && exit 0 || exit 1
