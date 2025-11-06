#!/bin/bash

# Script: cache-refresh.sh
# Purpose: Quick cache clearing without code changes
# Usage: ./scripts/cache-refresh.sh

set -e  # Exit on error

echo "🧹 Clearing all caches..."
echo "=========================="

podman exec hafalan-app php artisan config:cache && echo "✅ Config cache cleared"
podman exec hafalan-app php artisan cache:clear && echo "✅ Application cache cleared"
podman exec hafalan-app php artisan route:cache && echo "✅ Routes cache cleared"
podman exec hafalan-app php artisan view:clear && echo "✅ Views cache cleared"

echo ""
echo "✅ All caches cleared successfully!"
echo "=========================="
echo "💡 Hard refresh your browser (Ctrl+F5) to see changes"
echo ""
