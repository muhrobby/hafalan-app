# 🚨 502 Bad Gateway Error - Prevention & Resolution Guide

## 📋 What Causes 502 Errors?

**502 Bad Gateway** biasanya terjadi karena:

1. **🔴 Permission Issues** - `/var/www/html/storage` folder tidak bisa di-write oleh PHP-FPM
2. **🔴 PHP-FPM Crash** - Container PHP-FPM crashed atau tidak listening di port 9000
3. **🔴 Nginx DNS Cache Stale** - Setelah container restart, Nginx cache DNS lama sebelum re-resolve

## ⚡ Quick Fix (1 menit)

```bash
cd /home/robby/stacks/prod/hafalan
./scripts/fix-502.sh
```

**Output yang diharapkan:**
```
✅ 502 Fix Complete!
```

Jika masih 502, lanjut ke [Manual Steps](#manual-fix) dibawah.

---

## 🔧 Manual Fix (5 menit)

### Step 1: Fix Storage Permissions
```bash
# Ini adalah root cause 502 errors
podman exec hafalan-app sh -c "chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache"
```

### Step 2: Clear All Caches
```bash
podman exec hafalan-app php artisan cache:clear
podman exec hafalan-app php artisan view:clear
podman exec hafalan-app php artisan config:clear
```

### Step 3: Restart PHP-FPM
```bash
podman restart hafalan-app
sleep 2
```

### Step 4: Restart Nginx (Critical for DNS refresh)
```bash
podman restart hafalan-web
sleep 3
```

### Step 5: Verify
```bash
# Test the login page
curl -I https://hafalan.humahub.my.id/login --insecure
# Should return: HTTP/2 200
```

---

## 🛡️ Prevention (Prevent Terulang)

### **Option 1: Schedule Daily Health Check** (Recommended)
```bash
# Run daily via cron
0 2 * * * cd /home/robby/stacks/prod/hafalan && ./scripts/health-check.sh

# Or manually once per day:
./scripts/health-check.sh
```

**Health check akan:**
- ✅ Fix storage permissions automatically
- ✅ Fix node_modules permissions
- ✅ Restart Nginx to refresh DNS
- ✅ Check for recent errors

### **Option 2: Include in Update Scripts** (Already Done ✓)
Semua script update sudah include permission fixes:
```bash
./scripts/update-backend.sh     # ✓ Include permission fix
./scripts/update-frontend.sh    # ✓ Include permission fix
./scripts/update-full.sh        # ✓ Include permission fix
./scripts/cache-refresh.sh      # ✓ Include permission check
```

### **Option 3: Fix Dockerfile** (Long-term Solution)
Ensure Dockerfile sets correct permissions pada startup:
```dockerfile
RUN chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache
```

---

## 🔍 Debugging

### Check Why 502 Happened

```bash
# 1. View PHP-FPM logs
podman logs hafalan-app | tail -50

# 2. Check storage folder
podman exec hafalan-app ls -la /var/www/html/storage/

# 3. Check if PHP-FPM is running
podman exec hafalan-app ps aux | grep php-fpm

# 4. Check Nginx error logs
podman logs hafalan-web | grep error
```

### Storage Permission Issues
```bash
# Check current permissions
podman exec hafalan-app ls -la /var/www/html/storage/

# Should show: drwxrwxrwx (777)
# If not, run permission fix:
podman exec hafalan-app chmod -R 777 /var/www/html/storage
```

### PHP-FPM Not Listening
```bash
# Check if port 9000 is listening
podman exec hafalan-app netstat -tlnp | grep 9000

# If not, restart:
podman restart hafalan-app
sleep 2

# Verify:
podman exec hafalan-app netstat -tlnp | grep 9000
```

---

## 🚀 Summary & Best Practices

| Action | Frequency | Command |
|--------|-----------|---------|
| **Prevent 502** | Daily | `./scripts/health-check.sh` |
| **After update** | Every update | Already included in update scripts |
| **If 502 occurs** | On demand | `./scripts/fix-502.sh` |
| **Check logs** | When issue | `podman logs hafalan-app` |

---

## 📞 Quick Reference

```bash
# 🆕 Quick auto-fix for 502
./scripts/fix-502.sh

# 🆕 Daily health check (prevents 502)
./scripts/health-check.sh

# Manual permission fix
podman exec hafalan-app chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Restart all containers
podman-compose restart

# View logs
podman logs hafalan-app -f
```

---

**Last Updated**: November 7, 2025  
**Related Issues**: 502 Bad Gateway, Permission Denied, PHP-FPM Down  
**Solution Added By**: Auto-fix Scripts (health-check.sh, fix-502.sh)
