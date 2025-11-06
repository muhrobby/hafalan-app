#!/bin/bash

# Script: troubleshoot.sh
# Purpose: Troubleshooting diagnostics untuk debug issues
# Usage: ./scripts/troubleshoot.sh

echo "🔍 Running Hafalan Troubleshooting Diagnostics..."
echo "=================================================="
echo ""

# Check container status
echo "📦 Container Status:"
echo "---"
podman-compose ps
echo ""

# Check app logs (last 20 lines)
echo "📋 Recent App Logs (last 20 lines):"
echo "---"
podman-compose logs app --tail=20
echo ""

# Check if database is running
echo "🗄️  Database Connection Test:"
echo "---"
if podman exec hafalan-app php artisan tinker --execute="dd('Database OK')" 2>/dev/null; then
    echo "✅ Database connection OK"
else
    echo "❌ Database connection FAILED"
fi
echo ""

# Check .env file
echo "🔐 Environment Variables Check:"
echo "---"
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo "   APP_NAME: $(grep APP_NAME .env | cut -d '=' -f2)"
    echo "   APP_ENV: $(grep APP_ENV .env | cut -d '=' -f2)"
    echo "   CACHE_STORE: $(grep CACHE_STORE .env | cut -d '=' -f2)"
else
    echo "❌ .env file not found"
fi
echo ""

# Check disk space
echo "💾 Disk Space:"
echo "---"
df -h | grep -E "Filesystem|/$" || df -h
echo ""

# Check git status
echo "📚 Git Status:"
echo "---"
git status --short || echo "Not a git repository"
echo ""

# Check build folder
echo "🏗️  Build Artifacts:"
echo "---"
if [ -d public/build ]; then
    echo "✅ public/build exists"
    echo "   Size: $(du -sh public/build | cut -f1)"
    echo "   Files: $(find public/build -type f | wc -l)"
else
    echo "❌ public/build folder not found - Need to rebuild"
fi
echo ""

# Check node_modules permissions
echo "📁 Node Modules Permissions:"
echo "---"
PERMS=$(podman exec hafalan-app sh -c "ls -ld node_modules/.bin | awk '{print \$1}'" 2>/dev/null || echo "error")
if [[ $PERMS == *"rwx"* ]]; then
    echo "✅ node_modules/.bin has correct permissions"
else
    echo "⚠️  node_modules/.bin permissions might be wrong: $PERMS"
fi
echo ""

echo "=================================================="
echo "✅ Diagnostics Complete!"
echo ""
echo "💡 If issues persist, try these commands:"
echo "   1. Cache refresh: ./scripts/cache-refresh.sh"
echo "   2. Full rebuild: ./scripts/update-full.sh"
echo "   3. Restart containers: podman-compose restart"
echo ""
