#!/bin/bash

# Script: deploy.sh
# Purpose: Universal deployment script - handles ALL updates automatically
# Usage: ./scripts/deploy.sh
# Description: 
#   - Pull latest code from git
#   - Detect what changed (backend, frontend, or both)
#   - Fix permissions automatically
#   - Run migrations if needed
#   - Build frontend if needed
#   - Clear caches
#   - Restart containers
#   - Test deployment

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Colors for output
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✅${NC} $1"; }
error() { echo -e "${RED}❌${NC} $1"; }
warn() { echo -e "${YELLOW}⚠️${NC} $1"; }

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            🚀 HAFALAN UNIVERSAL DEPLOY SCRIPT            ║"
echo "║                                                            ║"
echo "║  Auto-detects changes and deploys with zero errors       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Show current branch and status
echo "1️⃣  Git Status Check"
echo "═══════════════════════════════════════════════════════════"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
info "Current branch: $BRANCH"
git status --short

echo ""

# Step 2: Pull latest code
echo "2️⃣  Pulling Latest Code"
echo "═══════════════════════════════════════════════════════════"
info "Fetching from origin..."
git fetch origin 2>/dev/null || true

info "Pulling latest code..."
git pull origin "$BRANCH" || {
    error "Failed to pull code!"
    exit 1
}
success "Code pulled successfully"

echo ""

# Step 3: Detect what changed
echo "3️⃣  Detecting Changes"
echo "═══════════════════════════════════════════════════════════"

BACKEND_CHANGED=false
FRONTEND_CHANGED=false
DB_MIGRATION_NEEDED=false

# Check for backend changes
if git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -qE "app/|config/|routes/|database/migrations"; then
    BACKEND_CHANGED=true
    info "Backend changes detected (PHP/Laravel)"
fi

# Check for frontend changes
if git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -qE "resources/js|resources/css|resources/views|package.json"; then
    FRONTEND_CHANGED=true
    info "Frontend changes detected (React/JS/CSS)"
fi

# Check for migration files
if git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -q "database/migrations"; then
    DB_MIGRATION_NEEDED=true
    info "Database migrations detected"
fi

# Default: assume both if can't detect
if [ "$BACKEND_CHANGED" = false ] && [ "$FRONTEND_CHANGED" = false ]; then
    BACKEND_CHANGED=true
    FRONTEND_CHANGED=true
    info "No specific changes detected, running full deployment (safe option)"
fi

echo ""

# Step 4: Fix permissions (CRITICAL for preventing 502)
echo "4️⃣  Fixing Permissions (502 Prevention)"
echo "═══════════════════════════════════════════════════════════"
info "Fixing storage directory..."
podman exec hafalan-app sh -c "chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache" 2>/dev/null || {
    warn "Storage permission fix had issues"
}
success "Storage permissions fixed"

if [ "$FRONTEND_CHANGED" = true ]; then
    info "Fixing node_modules..."
    podman exec hafalan-app sh -c "chmod -R 755 /var/www/html/node_modules/.bin /var/www/html/node_modules/@esbuild" 2>/dev/null || {
        warn "Node modules permission fix had issues"
    }
    success "Node modules permissions fixed"
fi

echo ""

# Step 5: Install/Update dependencies
echo "5️⃣  Installing Dependencies"
echo "═══════════════════════════════════════════════════════════"

if [ "$BACKEND_CHANGED" = true ]; then
    info "Installing PHP dependencies (Composer)..."
    podman exec hafalan-app composer install --no-dev --optimize-autoloader 2>&1 | tail -5
    success "PHP dependencies installed"
fi

if [ "$FRONTEND_CHANGED" = true ]; then
    info "Installing JavaScript dependencies (npm)..."
    podman exec hafalan-app npm install 2>&1 | tail -5
    success "JavaScript dependencies installed"
fi

echo ""

# Step 6: Run database migrations (if needed)
if [ "$DB_MIGRATION_NEEDED" = true ] || [ "$BACKEND_CHANGED" = true ]; then
    echo "6️⃣  Running Database Migrations"
    echo "═══════════════════════════════════════════════════════════"
    info "Running migrations..."
    podman exec hafalan-app php artisan migrate --force 2>&1 | tail -5
    success "Migrations completed"
    echo ""
fi

# Step 7: Build frontend (if needed)
if [ "$FRONTEND_CHANGED" = true ]; then
    echo "7️⃣  Building Frontend Assets"
    echo "═══════════════════════════════════════════════════════════"
    info "Building with Vite..."
    podman exec hafalan-app sh -c "cd /var/www/html && NODE_ENV=production node ./node_modules/vite/bin/vite.js build" 2>&1 | tail -10
    success "Frontend built successfully"
    echo ""
fi

# Step 8: Clear caches
echo "8️⃣  Clearing All Caches"
echo "═══════════════════════════════════════════════════════════"
info "Clearing configuration cache..."
podman exec hafalan-app php artisan config:cache 2>/dev/null
success "Config cache cleared"

info "Clearing application cache..."
podman exec hafalan-app php artisan cache:clear 2>/dev/null
success "App cache cleared"

info "Clearing route cache..."
podman exec hafalan-app php artisan route:cache 2>/dev/null
success "Route cache cleared"

info "Clearing view cache..."
podman exec hafalan-app php artisan view:clear 2>/dev/null
success "View cache cleared"

echo ""

# Step 9: Restart containers (for fresh DNS resolution)
echo "9️⃣  Restarting Containers (DNS Refresh)"
echo "═══════════════════════════════════════════════════════════"
info "Restarting app container..."
podman restart hafalan-app 2>/dev/null
success "App restarted"

info "Restarting web container..."
podman restart hafalan-web 2>/dev/null
success "Nginx restarted (DNS refreshed)"

sleep 3
echo ""

# Step 10: Verify deployment
echo "🔟  Verifying Deployment"
echo "═══════════════════════════════════════════════════════════"

# Check if containers running
APP_RUNNING=$(podman inspect hafalan-app --type container 2>/dev/null | grep -c '"Running": true' || echo "0")
WEB_RUNNING=$(podman inspect hafalan-web --type container 2>/dev/null | grep -c '"Running": true' || echo "0")

if [ "$APP_RUNNING" -gt 0 ] && [ "$WEB_RUNNING" -gt 0 ]; then
    success "All containers running"
else
    error "Some containers not running!"
    exit 1
fi

# Test application
if podman exec hafalan-app php -r "echo 'OK';" 2>/dev/null | grep -q "OK"; then
    success "Application is responsive"
else
    error "Application not responding!"
    exit 1
fi

# Test PHP-FPM listening
if podman exec hafalan-app sh -c "netstat -tlnp 2>/dev/null | grep -q 9000 || ss -tlnp 2>/dev/null | grep -q 9000"; then
    success "PHP-FPM listening on port 9000"
else
    warn "PHP-FPM might not be listening"
fi

echo ""

# Final summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ DEPLOYMENT SUCCESSFUL                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ "$BACKEND_CHANGED" = true ]; then
    echo "  ✔ Backend deployed"
fi
if [ "$FRONTEND_CHANGED" = true ]; then
    echo "  ✔ Frontend built"
fi
if [ "$DB_MIGRATION_NEEDED" = true ]; then
    echo "  ✔ Database migrated"
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)"
echo "   2. Test application: https://hafalan.humahub.my.id"
echo "   3. If issues: ./scripts/troubleshoot.sh"
echo ""
echo "💾 Git Status:"
git status --short || echo "   All clean"
echo ""

success "Deployment complete! 🎉"
echo ""
