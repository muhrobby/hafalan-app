#!/bin/bash

# Script: fix-502.sh
# Purpose: Automated fix untuk 502 Bad Gateway errors
# Usage: ./scripts/fix-502.sh
# This script specifically targets the common causes of 502 errors:
# - Permission issues in storage directories
# - PHP-FPM connectivity problems
# - Nginx DNS cache issues

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚨 Hafalan 502 Error Auto-Fix"
echo "=============================="
echo ""

echo "Step 1: Ensuring containers are running..."
podman-compose up -d 2>/dev/null
sleep 2
echo -e "${GREEN}✅${NC} Containers started"
echo ""

echo "Step 2: Fixing storage directory permissions..."
podman exec hafalan-app sh -c "chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache" 2>/dev/null
echo -e "${GREEN}✅${NC} Permissions fixed"
echo ""

echo "Step 3: Clearing all caches..."
podman exec hafalan-app php artisan cache:clear 2>/dev/null
podman exec hafalan-app php artisan view:clear 2>/dev/null
podman exec hafalan-app php artisan config:clear 2>/dev/null
echo -e "${GREEN}✅${NC} Caches cleared"
echo ""

echo "Step 4: Restarting PHP-FPM..."
podman restart hafalan-app 2>/dev/null && echo -e "${GREEN}✅${NC} PHP-FPM container restarted" || echo -e "${YELLOW}⚠️${NC} Could not restart app"
sleep 2
echo ""

echo "Step 5: Restarting Nginx (refresh DNS)..."
podman restart hafalan-web 2>/dev/null && echo -e "${GREEN}✅${NC} Nginx restarted" || echo -e "${RED}❌${NC} Failed to restart Nginx"
sleep 3
echo ""

echo "Step 6: Testing connectivity..."
# Try multiple times to ensure connection is stable
for i in {1..3}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/index.php 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" != "502" ] && [ "$HTTP_CODE" != "000" ]; then
        echo -e "${GREEN}✅${NC} Test $i: HTTP $HTTP_CODE (Success)"
        break
    else
        echo -e "${YELLOW}⏳${NC} Test $i: HTTP $HTTP_CODE - Retrying..."
        sleep 2
    fi
done
echo ""

echo "=============================="
echo -e "${GREEN}✅ 502 Fix Complete!${NC}"
echo ""
echo "If you still see 502 errors:"
echo "1. Check logs: podman-compose logs app"
echo "2. Verify database: podman-compose logs db"
echo "3. Run health check: ./scripts/health-check.sh"
echo ""
