# Deployment Workflow - Step by Step Guide

## 📋 Table of Contents
1. [Development Workflow](#development-workflow)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Steps](#deployment-steps)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedure](#rollback-procedure)
6. [Troubleshooting](#troubleshooting)

---

## Development Workflow

### Step 1: Create Feature Branch (Optional but Recommended)
```bash
# Go to project directory
cd /home/robby/stacks/prod/hafalan

# Create feature branch
git checkout -b feature/your-feature-name

# Example:
git checkout -b feature/add-student-export
```

### Step 2: Make Code Changes Locally

#### For PHP/Laravel Changes
```bash
# Edit your files
nano app/Http/Controllers/StudentController.php
# or use your preferred editor

# If adding migration:
php artisan make:migration create_student_exports_table
# Edit the migration file
nano database/migrations/2025_11_03_xxxxx_create_student_exports_table.php
```

#### For Frontend/JavaScript Changes
```bash
# Edit React components or CSS
nano resources/js/pages/students/Index.tsx
nano resources/css/app.css

# Run build locally (if you have Node.js installed)
npm run build
```

### Step 3: Test Locally (if possible)
```bash
# If developing locally (not in Docker):
php artisan serve
# Access at http://localhost:8000

# Run tests
php artisan test

# Check code style
php artisan pint  # or whatever linter you use
```

### Step 4: Commit Changes
```bash
# Check what changed
git status

# Stage changes
git add app/Http/Controllers/StudentController.php
# or add all
git add .

# Commit with descriptive message
git commit -m "feat: Add student export functionality

- Add StudentExportController to handle export logic
- Create StudentExport model for export tracking
- Add export button to student list page
- Include tests for export functionality"

# Or if quick fix:
git commit -m "fix: Fix typo in student form validation message"
```

---

## Pre-Deployment Checklist

### Before Pushing to Production

```bash
# 1. Check your commits
git log --oneline -5
# Pastikan commit messages jelas dan informative

# 2. Check file changes
git diff origin/main...HEAD
# Review semua changes yang akan di-deploy

# 3. Run final tests
php artisan test

# 4. Build assets (jika ada frontend changes)
npm run build

# 5. Check migrations (jika ada)
php artisan migrate --dry-run
# Pastikan migrations valid sebelum actual run
```

### Deployment Decision Matrix

| Type of Change | Risk Level | Deployment Method | Downtime Required |
|---|---|---|---|
| CSS/JS only | LOW | Direct push + cache clear | None |
| PHP logic only | MEDIUM | Direct push + test | None |
| Database migration | HIGH | Plan carefully | Minimal |
| Config changes | HIGH | Plan carefully | Maybe |
| Multiple systems | CRITICAL | Staged deployment | Plan carefully |

---

## Deployment Steps

### Method A: Simple Deployment (No Migrations, No Config Changes)

**Use Case:** CSS/JS changes, simple bug fixes, small feature additions

```bash
# Step 1: Commit and push to git
git add .
git commit -m "feat: Your feature description"
git push origin main

# Step 2: Pull latest on production server
cd /home/robby/stacks/prod/hafalan
git pull origin main

# Step 3: Build frontend assets (if needed)
npm run build

# Step 4: Clear Laravel cache
podman exec hafalan-app php artisan cache:clear
podman exec hafalan-app php artisan config:cache
podman exec hafalan-app php artisan route:cache

# Step 5: Reload Nginx (if config changed)
podman exec hafalan-web nginx -s reload

# Step 6: Verify deployment
curl -I https://hafalan.humahub.my.id/
# Should return HTTP 200/302 (not 500)

echo "✅ Deployment complete!"
```

**Estimated time:** 2-5 minutes

---

### Method B: Database Migration Deployment

**Use Case:** Changes dengan database migration

⚠️ **IMPORTANT:** Database migrations bisa destructive. Plan carefully!

```bash
# Step 1: Local testing
php artisan migrate --dry-run  # Review what will happen

# Step 2: Create backup (CRITICAL!)
podman exec hafalan-db-postgres pg_dump \
  -U hafalan_user \
  -d hafalan_db \
  -F c -b -v -f /tmp/hafalan_backup_$(date +%Y%m%d_%H%M%S).dump

# Verify backup created
ls -lh /tmp/hafalan_backup_*.dump

# Step 3: Commit code with migration
git add database/migrations/
git add app/Models/
git commit -m "feat: Add student export functionality with migration"
git push origin main

# Step 4: Pull on production
cd /home/robby/stacks/prod/hafalan
git pull origin main

# Step 5: Run migration
podman exec hafalan-app php artisan migrate

# Or if using steps approach:
podman exec hafalan-app php artisan migrate --step --force

# Step 6: Clear cache
podman exec hafalan-app php artisan cache:clear

# Step 7: Verify
curl -s https://hafalan.humahub.my.id/api/health | head -20
```

**Estimated time:** 5-10 minutes (depends on migration complexity)

---

### Method C: Major Feature Deployment (with downtime)

**Use Case:** Major feature, critical config changes, multiple systems affected

```bash
# Step 1: Prepare
git add .
git commit -m "feat: Major feature - description"
git push origin main

# Step 2: Notify users (optional)
echo "Maintenance window: 5-10 minutes"
# atau post di homepage/Slack

# Step 3: Stop services
cd /home/robby/stacks/prod/hafalan

# Create backup FIRST
podman exec hafalan-db-postgres pg_dump \
  -U hafalan_user \
  -d hafalan_db \
  -F c -b -v -f /tmp/hafalan_backup_critical_$(date +%Y%m%d_%H%M%S).dump

# Step 4: Pull code
git pull origin main

# Step 5: Build if needed
npm run build

# Step 6: Run migrations
podman exec hafalan-app php artisan migrate --force

# Step 7: Clear all caches
podman exec hafalan-app php artisan cache:clear
podman exec hafalan-app php artisan config:cache
podman exec hafalan-app php artisan route:cache
podman exec hafalan-app php artisan view:cache

# Step 8: Reload containers
podman-compose restart app web

# Wait for containers to be ready
sleep 5

# Step 9: Verify
curl -I https://hafalan.humahub.my.id/
```

**Estimated time:** 10-20 minutes

---

## Post-Deployment Verification

### Automated Health Checks

```bash
# Test 1: Homepage loads
echo "Testing homepage..."
status=$(curl -s -o /dev/null -w "%{http_code}" https://hafalan.humahub.my.id/)
if [ "$status" = "200" ] || [ "$status" = "302" ]; then
  echo "✅ Homepage: OK ($status)"
else
  echo "❌ Homepage: FAILED ($status)"
fi

# Test 2: CSS assets load
echo "Testing CSS assets..."
status=$(curl -s -o /dev/null -w "%{http_code}" https://hafalan.humahub.my.id/build/assets/app*.css)
if [ "$status" = "200" ]; then
  echo "✅ CSS assets: OK"
else
  echo "❌ CSS assets: FAILED ($status)"
fi

# Test 3: JavaScript assets load
echo "Testing JS assets..."
status=$(curl -s -o /dev/null -w "%{http_code}" https://hafalan.humahub.my.id/build/assets/app*.js)
if [ "$status" = "200" ]; then
  echo "✅ JS assets: OK"
else
  echo "❌ JS assets: FAILED ($status)"
fi

# Test 4: API endpoint (if exists)
echo "Testing API..."
status=$(curl -s -o /dev/null -w "%{http_code}" https://hafalan.humahub.my.id/api/health)
if [ "$status" = "200" ]; then
  echo "✅ API: OK"
else
  echo "❌ API: FAILED ($status)"
fi

# Test 5: Check for 502 errors
echo "Stress testing (10 requests)..."
errors=0
for i in {1..10}; do
  status=$(curl -s -o /dev/null -w "%{http_code}" https://hafalan.humahub.my.id/)
  if [ "$status" = "502" ]; then
    ((errors++))
  fi
done
if [ $errors -eq 0 ]; then
  echo "✅ Stress test: OK (0 errors)"
else
  echo "❌ Stress test: FAILED ($errors errors)"
fi
```

### Manual Verification

```bash
# Check logs for errors
podman logs hafalan-app 2>&1 | tail -20 | grep -i error
# Should be empty or no recent errors

# Check Nginx status
podman logs hafalan-web 2>&1 | tail -5
# Should show normal requests, no 502/504 errors

# Check database connection
podman exec hafalan-app php artisan tinker
# In tinker shell:
> \Illuminate\Support\Facades\DB::connection()->getPdo()
> exit
# Should connect successfully

# Verify code changes deployed
podman exec hafalan-app git log --oneline -5
# Should show your new commits
```

### Browser Testing Checklist

- [ ] Homepage loads without errors
- [ ] CSS/JS loading (no MIME type errors in console)
- [ ] Login page accessible
- [ ] Dashboard loads (if authenticated)
- [ ] Can navigate between pages
- [ ] No 404 for static assets
- [ ] No JavaScript console errors
- [ ] Refresh page doesn't cause 502

---

## Rollback Procedure

### If Something Goes Wrong

```bash
# STOP! Don't panic. Follow these steps:

# Step 1: Identify the issue
podman logs hafalan-app 2>&1 | tail -50 | grep -i error
# or check browser console for errors

# Step 2: Quick fixes to try

# Option A: Clear cache (fixes most issues)
podman exec hafalan-app php artisan cache:clear
podman exec hafalan-app php artisan config:cache
podman exec hafalan-web nginx -s reload
# Wait 5 seconds and test

# Option B: If database migration failed, rollback one step
podman exec hafalan-app php artisan migrate:rollback --step=1
# Test, then investigate migration

# Option C: Full rollback to previous version
git log --oneline -10
git revert HEAD  # Reverts last commit
# or
git reset --hard HEAD~1  # Hard reset to previous commit (use carefully!)
git push origin main
podman-compose restart app
```

### Complete Rollback to Last Known Good State

```bash
# If previous steps don't work:

# 1. Note the commit hash of last known good state
git log --oneline -20
# Find the commit that was working

# 2. Revert to that commit
git reset --hard <commit-hash>
git push origin main --force  # Force push (careful!)

# 3. Rebuild and restart
npm run build
podman-compose restart app web

# 4. If database was affected, restore from backup
podman-compose down
podman exec hafalan-db-postgres pg_restore \
  -U hafalan_user \
  -d hafalan_db \
  -v /tmp/hafalan_backup_<timestamp>.dump
podman-compose up -d

# 5. Verify
curl -I https://hafalan.humahub.my.id/
```

### Restore from Database Backup

```bash
# List available backups
ls -lh /tmp/hafalan_backup_*.dump

# Restore from specific backup
podman exec hafalan-db-postgres pg_restore \
  -U hafalan_user \
  -d hafalan_db \
  -v /tmp/hafalan_backup_20251103_180000.dump

# Verify database
podman exec hafalan-app php artisan tinker
# In tinker:
> DB::select('SELECT COUNT(*) FROM students')
> exit
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: 500 Internal Server Error
```bash
# Check PHP errors
podman logs hafalan-app 2>&1 | grep -A 5 "Exception\|Error"

# Check if migration failed
podman exec hafalan-app php artisan migrate:status

# Check cache corruption
podman exec hafalan-app php artisan cache:clear
podman exec hafalan-app php artisan config:cache
```

#### Issue: 502 Bad Gateway
```bash
# Check FastCGI buffers (see QUICK_REFERENCE.md)
podman logs hafalan-web | grep "upstream sent too big header"

# Reload Nginx
podman exec hafalan-web nginx -s reload

# If persists, check PHP-FPM
podman exec hafalan-app php -v
podman logs hafalan-app | tail -20
```

#### Issue: 404 for Assets
```bash
# Check if assets exist
podman exec hafalan-web ls /var/www/html/public/build/assets/ | wc -l

# If empty, rebuild
podman exec hafalan-app npm run build
podman cp hafalan-app:/var/www/html/public/build/. public/build/

# Clear Cloudflare cache
# Login to https://dash.cloudflare.com
# Domain → Caching → Purge Cache → Purge Everything
```

#### Issue: Database Connection Failed
```bash
# Check database is running
podman ps | grep postgres

# Check credentials in .env
cat .env | grep DB_

# Test connection
podman exec hafalan-app php artisan tinker
# > DB::connection()->getPdo()

# If failed, check database logs
podman logs hafalan-db-postgres | tail -20
```

#### Issue: CSS Not Applying (Wrong MIME Type)
```bash
# Check response header
curl -I https://hafalan.humahub.my.id/build/assets/app*.css | grep Content-Type
# Should show: Content-Type: text/css

# If showing text/html:
# 1. Purge Cloudflare cache
# 2. Hard refresh browser (Ctrl+Shift+R)
# 3. Check Nginx config
podman exec hafalan-web cat /etc/nginx/conf.d/default.conf | grep -A 5 "build"
```

---

## Quick Deployment Script

### Create automated deployment script

File: `deploy.sh`
```bash
#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting Hafalan Deployment..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo "📥 Pulling latest code..."
cd /home/robby/stacks/prod/hafalan
git pull origin main || { echo -e "${RED}❌ Git pull failed${NC}"; exit 1; }

# Step 2: Build assets
echo "🔨 Building frontend assets..."
npm run build || { echo -e "${RED}❌ Build failed${NC}"; exit 1; }

# Step 3: Run migrations (if any)
echo "🗄️  Running database migrations..."
podman exec hafalan-app php artisan migrate --force || { echo -e "${RED}❌ Migration failed${NC}"; exit 1; }

# Step 4: Clear caches
echo "🧹 Clearing caches..."
podman exec hafalan-app php artisan cache:clear
podman exec hafalan-app php artisan config:cache

# Step 5: Verify deployment
echo "✅ Verifying deployment..."
status=$(curl -s -o /dev/null -w "%{http_code}" https://hafalan.humahub.my.id/)
if [ "$status" = "200" ] || [ "$status" = "302" ]; then
  echo -e "${GREEN}✅ Deployment successful!${NC}"
  echo "Status: HTTP $status"
else
  echo -e "${RED}❌ Deployment verification failed!${NC}"
  echo "Status: HTTP $status"
  exit 1
fi
```

### Make it executable and use
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Summary Checklist

### For Each Deployment:

- [ ] Code changes committed with clear messages
- [ ] All tests pass locally
- [ ] Backed up database (if migration)
- [ ] Pulled latest code on production
- [ ] Built frontend assets
- [ ] Ran migrations (if needed)
- [ ] Cleared caches
- [ ] Reloaded services
- [ ] Verified deployment with health checks
- [ ] Checked browser for errors
- [ ] Monitored logs for 5-10 minutes

### Monthly Maintenance:

- [ ] Review and clean old database backups
- [ ] Check disk space on production server
- [ ] Update dependencies (carefully)
- [ ] Review error logs for patterns
- [ ] Test rollback procedure (in staging)
- [ ] Update documentation if needed

---

## Important Notes

⚠️ **NEVER:**
- Push directly to production without testing
- Skip backups before migrations
- Use `--force` flag on migrations lightly
- Ignore error messages
- Forget to check logs after deployment

✅ **ALWAYS:**
- Backup database before migrations
- Test locally if possible
- Check logs after deployment
- Have rollback plan ready
- Document significant changes
- Communicate with team about downtime

---

## References

- [Laravel Deployment](https://laravel.com/docs/11.x/deployment)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Docker/Podman Documentation](https://docs.docker.com/)
- [Git Workflow](https://git-scm.com/book/en/v2)

---

**Last Updated:** 3 November 2025  
**Version:** 1.0  
**Status:** Complete & Ready to Use
