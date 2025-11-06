#!/bin/bash

# Script: update-backend.sh
# Purpose: Update backend code (Laravel) dengan automated steps
# Usage: ./scripts/update-backend.sh

set -e  # Exit on error

echo "🔄 Starting Backend Update Process..."
echo "=================================="

# Step 1: Pull latest code
echo "📥 Pulling latest code from Git..."
git pull origin main

# Step 2: Install PHP dependencies
echo "📦 Installing Composer dependencies..."
podman exec hafalan-app composer install --no-dev --optimize-autoloader

# Step 3: Run migrations
echo "🗄️  Running database migrations..."
podman exec hafalan-app php artisan migrate --force

# Step 4: Clear caches
echo "🧹 Clearing caches..."
podman exec hafalan-app php artisan config:cache
podman exec hafalan-app php artisan cache:clear

# Step 5: Clear routes cache (optional but recommended)
echo "🛣️  Clearing routes cache..."
podman exec hafalan-app php artisan route:clear
podman exec hafalan-app php artisan route:cache

echo ""
echo "✅ Backend Update Complete!"
echo "=================================="
echo "📍 Next steps:"
echo "   1. Verify changes in browser: https://hafalan.humahub.my.id"
echo "   2. Check logs if any issues: podman-compose logs app"
echo ""
