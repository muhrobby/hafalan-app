# 🎯 Maintenance Scripts Improvements

## Problem Yang Diselesaikan

Pada **November 7, 2025 pukul 02:27 UTC**, terjadi error **502 Bad Gateway** di login page.

**Root Cause Analysis:**
1. ❌ Permission issue di `/var/www/html/storage/` - PHP-FPM tidak bisa write
2. ❌ Container restart tanpa update permissions
3. ❌ Nginx cache DNS stale setelah app container restart

**Masalah**: Error ini bisa terulang jika tidak ada automatic maintenance.

---

## ✅ Solution Implemented

### 🆕 New Scripts Added

#### 1. **health-check.sh** - Daily Preventive Maintenance
```bash
./scripts/health-check.sh
```

**Fungsi:**
- ✅ Check container status
- ✅ Fix storage permissions (CRITICAL)
- ✅ Fix node_modules permissions
- ✅ Check PHP-FPM connectivity
- ✅ Restart Nginx (refresh DNS)
- ✅ Test application responsiveness
- ✅ Check disk space
- ✅ Alert if errors in logs

**Rekomendasi**: Jalankan daily atau setelah setiap deployment.

---

#### 2. **fix-502.sh** - Quick Emergency Fix
```bash
./scripts/fix-502.sh
```

**Fungsi:**
- ✅ Ensure containers running
- ✅ Fix storage permissions
- ✅ Clear all caches
- ✅ Restart PHP-FPM & Nginx
- ✅ Test connectivity

**Rekomendasi**: Jalankan jika terjadi 502 error.

---

### 📝 Updated Scripts

Semua script update sudah di-enhance untuk include permission fixes:

#### **update-full.sh**
```diff
+ Step 4: Fix ALL permissions (CRITICAL for preventing 502 errors)
  - chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache
  - chmod -R 755 node_modules/.bin && chmod -R 755 node_modules/@esbuild
+ Step 7: Restart containers to ensure fresh DNS resolution
```

#### **update-backend.sh**
```diff
+ Step 3: Fix storage permissions BEFORE running migrations
  - chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache
```

#### **update-frontend.sh**
```diff
+ Step 3: Fix node_modules and storage permissions
+ Step 6: Restart Nginx for fresh DNS resolution
```

#### **cache-refresh.sh**
```diff
+ First, ensure storage permissions are good (prevent 502 errors)
  - chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache
```

---

### 📚 Updated Documentation

1. **FIX_502_ERRORS.md** - New!
   - Detailed guide untuk 502 errors
   - Prevention strategies
   - Debugging commands

2. **MAINTENANCE_GUIDE.md** - Enhanced
   - Added 502 error troubleshooting section
   - Detailed prevention steps

3. **QUICK_MAINTENANCE.md** - Enhanced
   - Added scenarios 7 & 8 (500/502 fix, health check)
   - Updated all script references
   - Added 502 debugging section

---

## 🚀 Recommended Maintenance Schedule

### **Daily**
```bash
# Run once per day (preferably at 2 AM)
./scripts/health-check.sh
```

Set up cron job:
```bash
# Add to crontab
0 2 * * * cd /home/robby/stacks/prod/hafalan && ./scripts/health-check.sh

# Or use system timer (systemd):
# Create /etc/systemd/system/hafalan-health.timer
```

### **After Every Deployment**
Scripts already handle it:
```bash
./scripts/update-full.sh
./scripts/update-backend.sh
./scripts/update-frontend.sh
# All include permission fixes + nginx restart
```

### **If 502 Error Occurs**
```bash
./scripts/fix-502.sh
# Atau manual:
podman exec hafalan-app chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache
podman restart hafalan-web
```

---

## 📊 Files Changed/Created

```
NEW:
  ✨ scripts/health-check.sh       (4.7 KB) - Daily maintenance script
  ✨ scripts/fix-502.sh             (2.2 KB) - Emergency 502 fix script
  ✨ FIX_502_ERRORS.md             (3.5 KB) - 502 Error guide

UPDATED:
  📝 scripts/update-full.sh         - Added permission fix + restart
  📝 scripts/update-backend.sh      - Added permission fix
  📝 scripts/update-frontend.sh     - Added permission fix + nginx restart
  📝 scripts/cache-refresh.sh       - Added permission check
  📝 MAINTENANCE_GUIDE.md           - Added 502 troubleshooting
  📝 QUICK_MAINTENANCE.md           - Added new scenarios + debugging
```

---

## 🔍 How To Use

### **Scenario 1: Prevent 502 from Happening**
```bash
# Daily health check
./scripts/health-check.sh

# Or schedule it:
# (0 2 * * * /path/to/script/health-check.sh) in crontab
```

### **Scenario 2: Error 502 Terjadi**
```bash
# Quick auto-fix (< 2 minutes)
./scripts/fix-502.sh

# Then verify:
curl https://hafalan.humahub.my.id/login --insecure
# Should return: 200 OK
```

### **Scenario 3: After Update**
```bash
# Script already includes permission fix
./scripts/update-full.sh

# No need to do manual permission fix
```

### **Scenario 4: Debugging Permission Issues**
```bash
# Check permissions
podman exec hafalan-app ls -la /var/www/html/storage/

# Fix if needed
podman exec hafalan-app chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Check PHP-FPM
podman exec hafalan-app ps aux | grep php-fpm

# Check Nginx DNS
podman exec hafalan-web nginx -t
```

---

## ✅ Testing & Validation

All scripts tested:
- ✅ health-check.sh - Successfully completes with all checks passing
- ✅ fix-502.sh - Successfully fixes 502 errors
- ✅ update-full.sh - Enhanced with permission fixes
- ✅ update-backend.sh - Enhanced with permission fixes
- ✅ update-frontend.sh - Enhanced with permission fixes + nginx restart
- ✅ cache-refresh.sh - Enhanced with permission checks
- ✅ Login page - HTTP 200 ✅ (verified after fix)

---

## 💡 Key Takeaways

| Aspek | Solusi |
|-------|--------|
| **Root Cause** | Storage permission issues + DNS cache |
| **Quick Fix** | `./scripts/fix-502.sh` |
| **Prevention** | `./scripts/health-check.sh` (daily) |
| **Updates Safe?** | ✅ Yes - all include permission fix |
| **Documentation** | ✅ Comprehensive guides added |
| **Status** | ✅ Ready for production |

---

**Last Updated**: November 7, 2025  
**Status**: ✅ Complete & Production Ready  
**Next Steps**: Schedule health-check.sh to run daily via cron
