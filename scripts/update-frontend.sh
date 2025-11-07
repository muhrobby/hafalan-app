#!/bin/bash

# Script: update-frontend.sh
# Purpose: Update frontend code (React/CSS/JS) dengan automated steps
# Usage: ./scripts/update-frontend.sh

set -e  # Exit on error

echo "🔄 Starting Frontend Update Process..."
echo "=================================="

# Step 1: Pull latest code
echo "📥 Pulling latest code from Git..."
git pull origin main

# Step 2: Install npm dependencies
echo "📦 Installing npm dependencies..."
podman exec hafalan-app npm install

# Step 3: Fix permissions (for production build)
echo "🔒 Fixing node_modules and storage permissions..."
podman exec hafalan-app sh -c "chmod -R 755 node_modules/.bin && chmod -R 755 node_modules/@esbuild"
podman exec hafalan-app sh -c "chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache"

# Step 4: Build assets
echo "🔨 Building frontend assets with Vite..."
podman exec hafalan-app sh -c "cd /var/www/html && NODE_ENV=production node ./node_modules/vite/bin/vite.js build"

# Step 5: Clear caches
echo "🧹 Clearing caches..."
podman exec hafalan-app php artisan cache:clear

# Step 6: Restart containers for fresh DNS resolution
echo "🔄 Restarting Nginx..."
podman-compose restart hafalan-web

echo ""
echo "✅ Frontend Update Complete!"
echo "=================================="
echo "📍 Next steps:"
echo "   1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)"
echo "   2. Verify changes in browser: https://hafalan.humahub.my.id"
echo "   3. Check console for errors (F12)"
echo ""
