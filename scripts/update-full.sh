#!/bin/bash

# Script: update-full.sh
# Purpose: Complete update (Backend + Frontend + Database)
# Usage: ./scripts/update-full.sh

set -e  # Exit on error

echo "🚀 Starting FULL Update Process (Backend + Frontend)..."
echo "========================================================"

# Step 1: Pull latest code
echo "📥 Pulling latest code from Git..."
git pull origin main

# Step 2: Install dependencies
echo "📦 Installing Composer dependencies..."
podman exec hafalan-app composer install --no-dev --optimize-autoloader

echo "📦 Installing npm dependencies..."
podman exec hafalan-app npm install

# Step 3: Run migrations
echo "🗄️  Running database migrations..."
podman exec hafalan-app php artisan migrate --force

# Step 4: Fix ALL permissions (CRITICAL for preventing 502 errors)
echo "🔒 Fixing all permissions..."
podman exec hafalan-app sh -c "chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache"
podman exec hafalan-app sh -c "chmod -R 755 node_modules/.bin && chmod -R 755 node_modules/@esbuild"

# Step 5: Build assets
echo "🔨 Building frontend assets with Vite..."
podman exec hafalan-app sh -c "cd /var/www/html && NODE_ENV=production node ./node_modules/vite/bin/vite.js build"

# Step 6: Clear all caches
echo "🧹 Clearing all caches..."
podman exec hafalan-app php artisan config:cache
podman exec hafalan-app php artisan cache:clear
podman exec hafalan-app php artisan route:cache
podman exec hafalan-app php artisan view:clear

# Step 7: Restart containers to ensure fresh DNS resolution
echo "🔄 Restarting containers..."
podman-compose restart

echo ""
echo "✅ FULL Update Complete!"
echo "========================================================"
echo "📍 Next steps:"
echo "   1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)"
echo "   2. Verify all changes: https://hafalan.humahub.my.id"
echo "   3. Check logs if any issues: podman-compose logs app"
echo ""
