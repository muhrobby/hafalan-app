#!/bin/bash

# Script: health-check.sh
# Purpose: Check sistem health dan fix common permission issues yang bisa cause 502 error
# Usage: ./scripts/health-check.sh
# Run this regularly (e.g., daily or after every deployment)

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🏥 Hafalan Health Check & Maintenance"
echo "======================================="
echo ""

# 1. Check if containers are running
echo "1️⃣  Checking container status..."
echo "---"
if podman inspect hafalan-app --type container 2>/dev/null | grep -q '"Running": true'; then
    echo -e "${GREEN}✅${NC} App container is running"
else
    echo -e "${RED}❌${NC} App container is NOT running!"
    echo "   Attempting to restart..."
    podman-compose up -d 2>/dev/null || podman start hafalan-app 2>/dev/null
fi

if podman inspect hafalan-web --type container 2>/dev/null | grep -q '"Running": true'; then
    echo -e "${GREEN}✅${NC} Web container is running"
else
    echo -e "${RED}❌${NC} Web container is NOT running!"
    echo "   Attempting to restart..."
    podman start hafalan-web 2>/dev/null || podman-compose restart hafalan-web 2>/dev/null
fi
echo ""

# 2. Fix storage directory permissions (MAIN ISSUE FIX)
echo "2️⃣  Fixing storage directory permissions..."
echo "---"
echo "   - Fixing /var/www/html/storage..."
podman exec hafalan-app sh -c "chmod -R 777 /var/www/html/storage" 2>/dev/null && \
    echo -e "${GREEN}✅${NC} Storage permissions fixed" || \
    echo -e "${YELLOW}⚠️${NC} Storage permission fix had issues"

echo "   - Fixing /var/www/html/bootstrap/cache..."
podman exec hafalan-app sh -c "chmod -R 777 /var/www/html/bootstrap/cache" 2>/dev/null && \
    echo -e "${GREEN}✅${NC} Bootstrap/cache permissions fixed" || \
    echo -e "${YELLOW}⚠️${NC} Bootstrap/cache permission fix had issues"
echo ""

# 3. Fix node_modules permissions
echo "3️⃣  Fixing node_modules permissions..."
echo "---"
podman exec hafalan-app sh -c "chmod -R 755 /var/www/html/node_modules/.bin" 2>/dev/null && \
    echo -e "${GREEN}✅${NC} node_modules/.bin permissions fixed" || \
    echo -e "${YELLOW}⚠️${NC} node_modules/.bin permission fix had issues"

podman exec hafalan-app sh -c "chmod -R 755 /var/www/html/node_modules/@esbuild" 2>/dev/null && \
    echo -e "${GREEN}✅${NC} @esbuild permissions fixed" || \
    echo -e "${YELLOW}⚠️${NC} @esbuild permission fix had issues"
echo ""

# 4. Check PHP-FPM connectivity
echo "4️⃣  Checking PHP-FPM connectivity..."
echo "---"
APP_RUNNING=$(podman inspect hafalan-app --type container 2>/dev/null | grep '"Running": true' || echo "")
if [ -n "$APP_RUNNING" ]; then
    echo -e "${GREEN}✅${NC} App container status: UP"
    # Check if FPM is listening
    if podman exec hafalan-app sh -c "netstat -tlnp 2>/dev/null | grep -q 9000 || ss -tlnp 2>/dev/null | grep -q 9000"; then
        echo -e "${GREEN}✅${NC} PHP-FPM is listening on port 9000"
    else
        echo -e "${YELLOW}⚠️${NC} PHP-FPM might not be listening on 9000"
    fi
else
    echo -e "${RED}❌${NC} App container is down"
fi
echo ""

# 5. Restart nginx to refresh DNS resolution
echo "5️⃣  Restarting Nginx (refresh DNS resolution)..."
echo "---"
podman restart hafalan-web 2>/dev/null && \
    echo -e "${GREEN}✅${NC} Nginx restarted successfully" || \
    echo -e "${RED}❌${NC} Failed to restart Nginx"
sleep 2
echo ""

# 6: Check if the application responds
echo "6️⃣  Testing application response..."
echo "---"
# Simple connectivity test via PHP-FPM
if podman exec hafalan-app php -r "echo 'OK';" 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✅${NC} Application is accessible (PHP OK)"
else
    echo -e "${RED}❌${NC} Application not responding properly"
fi
echo ""

# 7. Check disk space
echo "7️⃣  Checking disk space..."
echo "---"
USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅${NC} Disk usage: ${USAGE}% (OK)"
else
    echo -e "${YELLOW}⚠️${NC} Disk usage: ${USAGE}% (Consider cleanup)"
fi
echo ""

# 8. Check recent error logs
echo "8️⃣  Checking for recent errors in logs..."
echo "---"
ERROR_COUNT=$(podman logs hafalan-app --tail=100 2>/dev/null | grep -iE "error|failed|permission denied" | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅${NC} No recent errors in app logs"
else
    echo -e "${YELLOW}⚠️${NC} Found $ERROR_COUNT potential issues in app logs (last 5):"
    podman logs hafalan-app --tail=50 2>/dev/null | grep -iE "error|failed|permission denied" | tail -5 | sed 's/^/      /'
fi
echo ""

# Summary
echo "======================================="
echo -e "${GREEN}✅ Health Check Complete!${NC}"
echo ""
echo "💡 Next steps if issues persist:"
echo "   1. View full app logs: podman-compose logs app -f"
echo "   2. Run full update: ./scripts/update-full.sh"
echo "   3. Check nginx config: podman exec hafalan-web nginx -t"
echo ""
