# 📋 Panduan Maintenance & Update Fitur Hafalan

Dokumentasi lengkap untuk deployment, update fitur, dan maintenance di environment Podman.

---

## 📌 Quick Reference - Perintah Penting

```bash
# 1. PULL CODE CHANGES (dari repository/git)
git pull origin main

# 2. INSTALL/UPDATE DEPENDENCIES
podman exec hafalan-app composer install
podman exec hafalan-app npm install

# 3. RUN DATABASE MIGRATIONS (jika ada perubahan database)
podman exec hafalan-app php artisan migrate

# 4. CLEAR ALL CACHES
podman exec hafalan-app php artisan config:cache
podman exec hafalan-app php artisan cache:clear

# 5. BUILD FRONTEND ASSETS (jika ada perubahan React/CSS/JS)
podman exec hafalan-app sh -c "cd /var/www/html && chmod -R 755 node_modules/.bin && chmod -R 755 node_modules/@esbuild && node ./node_modules/vite/bin/vite.js build"

# 6. RESTART CONTAINERS (jika diperlukan)
podman-compose restart

# 7. CHECK STATUS
podman-compose ps
```

---

## 🚀 Workflow Update Fitur (Step by Step)

### **Scenario 1: Update Fitur Backend Only (Laravel)**

Gunakan ini jika hanya update Controller, Model, Routes, atau Logic di backend.

```bash
cd /home/robby/stacks/prod/hafalan

# 1. Pull latest code
git pull origin main

# 2. Install dependencies (jika ada package baru)
podman exec hafalan-app composer install

# 3. Run migrations (jika ada perubahan database)
podman exec hafalan-app php artisan migrate

# 4. Clear config cache
podman exec hafalan-app php artisan config:cache
podman exec hafalan-app php artisan cache:clear

# 5. Test dengan akses browser
# Buka: https://hafalan.humahub.my.id
```

**Durasi**: 2-5 menit (tergantung ukuran composer install)

---

### **Scenario 2: Update Fitur Frontend Only (React/CSS/JS)**

Gunakan ini jika hanya update React components, styles, atau JavaScript.

```bash
cd /home/robby/stacks/prod/hafalan

# 1. Pull latest code
git pull origin main

# 2. Install npm dependencies (jika ada package baru)
podman exec hafalan-app npm install

# 3. Build assets dengan Vite
podman exec hafalan-app sh -c "cd /var/www/html && chmod -R 755 node_modules/.bin && chmod -R 755 node_modules/@esbuild && node ./node_modules/vite/bin/vite.js build"

# 4. Clear caches
podman exec hafalan-app php artisan cache:clear

# 5. Hard refresh browser (Ctrl+F5) untuk lihat perubahan
```

**Durasi**: 3-7 menit (build time tergantung file yang berubah)

---

### **Scenario 3: Update Fitur Full Stack (Backend + Frontend)**

Gunakan ini jika ada perubahan di backend DAN frontend.

```bash
cd /home/robby/stacks/prod/hafalan

# 1. Pull latest code
git pull origin main

# 2. Install dependencies
podman exec hafalan-app composer install
podman exec hafalan-app npm install

# 3. Run database migrations (jika ada)
podman exec hafalan-app php artisan migrate

# 4. Build frontend
podman exec hafalan-app sh -c "cd /var/www/html && chmod -R 755 node_modules/.bin && chmod -R 755 node_modules/@esbuild && node ./node_modules/vite/bin/vite.js build"

# 5. Clear all caches
podman exec hafalan-app php artisan config:cache
podman exec hafalan-app php artisan cache:clear

# 6. Optional: Restart containers
podman-compose restart

# 7. Test di browser
```

**Durasi**: 5-15 menit

---

### **Scenario 4: Update Environment Variable (.env)**

Gunakan jika ada perubahan di file `.env` (APP_NAME, DATABASE, API Keys, dll).

```bash
cd /home/robby/stacks/prod/hafalan

# 1. Edit .env file
nano .env
# Atau buka dengan text editor favorit
# Ubah konfigurasi yang diperlukan
# Save file (Ctrl+O, Ctrl+X jika pakai nano)

# 2. Clear config cache (IMPORTANT!)
podman exec hafalan-app php artisan config:cache
podman exec hafalan-app php artisan cache:clear

# 3. Restart app container agar read ulang .env
podman-compose restart app

# 4. Verifikasi perubahan
podman exec hafalan-app php artisan config:app
```

**Durasi**: 1-3 menit

---

### **Scenario 5: Update Logo / Static Files**

Gunakan jika hanya update logo, favicon, atau gambar statis.

```bash
cd /home/robby/stacks/prod/hafalan

# 1. Replace file di folder public/
# Contoh: copy logo baru ke public/logo.svg
cp /path/to/new/logo.svg public/logo.svg

# 2. Clear caches
podman exec hafalan-app php artisan cache:clear

# 3. Hard refresh browser (Ctrl+F5 atau Cmd+Shift+R)
```

**Durasi**: < 1 menit

---

## 🛠️ Troubleshooting

### **⚠️ 502 Bad Gateway Error (CRITICAL)**

**Penyebab Umum:**
1. **Storage folder permission denied** - PHP-FPM tidak bisa write ke `/var/www/html/storage`
2. **PHP-FPM crash** - Container PHP-FPM tidak running atau tidak listening
3. **Nginx DNS cache stale** - Nginx cache DNS lama setelah container restart

**Solusi Cepat:**
```bash
# Option 1: Quick auto-fix
./scripts/fix-502.sh

# Option 2: Manual steps
# 1. Fix permissions
podman exec hafalan-app sh -c "chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache"

# 2. Clear caches
podman exec hafalan-app php artisan cache:clear

# 3. Restart containers (especially Nginx for fresh DNS)
podman-compose restart hafalan-web
```

**Pencegahan:**
- Jalankan `./scripts/health-check.sh` secara regular (daily/after deployment)
- Pastikan setiap script update sudah include permission fix
- Monitor logs: `podman-compose logs app -f`

---

### **Masalah: Perubahan tidak terlihat di browser**
```bash
# 1. Cek apakah cache sudah cleared
podman exec hafalan-app php artisan cache:clear

# 2. Cek apakah config sudah di-regenerate
podman exec hafalan-app php artisan config:cache

# 3. Hard refresh browser
# Windows/Linux: Ctrl + F5
# Mac: Cmd + Shift + R

# 4. Clear browser cache manual:
# - Chrome/Edge: Ctrl + Shift + Del
# - Firefox: Ctrl + Shift + Del
# - Safari: Develop menu > Empty Caches
```

### **Masalah: Build gagal dengan error permission**
```bash
# Fix permissions
podman exec hafalan-app sh -c "chmod -R 755 node_modules/.bin && chmod -R 755 node_modules/@esbuild"

# Coba build lagi
podman exec hafalan-app sh -c "cd /var/www/html && node ./node_modules/vite/bin/vite.js build"
```

### **Masalah: Container tidak running**
```bash
# Cek status
podman-compose ps

# Start ulang
podman-compose down && podman-compose up -d

# Lihat logs
podman-compose logs app
```

### **Masalah: Database migration error**
```bash
# Cek status migration
podman exec hafalan-app php artisan migrate:status

# Rollback jika perlu
podman exec hafalan-app php artisan migrate:rollback

# Re-run migration
podman exec hafalan-app php artisan migrate
```

---

## 📊 Container Information

| Container | Role | Port | Status |
|-----------|------|------|--------|
| **hafalan-app** | PHP-FPM (Backend) | 9000 | Running |
| **hafalan-db-postgres** | PostgreSQL Database | 5432 | Running |
| **hafalan-web** | Nginx (Web Server) | 80/443 | Running |

**URL Production**: https://hafalan.humahub.my.id

---

## 🔍 Monitoring & Logs

### **Melihat Logs**
```bash
# Logs app (PHP)
podman-compose logs app

# Logs web (Nginx)
podman-compose logs web

# Logs database (PostgreSQL)
podman-compose logs db

# Follow logs real-time
podman-compose logs -f app
```

### **Check Container Status**
```bash
# List all containers
podman-compose ps

# Check specific container
podman inspect hafalan-app

# Check resource usage
podman stats hafalan-app
```

---

## 🔐 Security Checklist

Sebelum production update:

- [ ] Commit semua changes ke git
- [ ] Test di development environment dulu
- [ ] Backup database: `podman exec hafalan-db-postgres pg_dump ...`
- [ ] Cek `.env` tidak punya credentials yang exposed
- [ ] Verify migrations yang akan dijalankan
- [ ] Test semua fitur yang berubah
- [ ] Check error logs setelah update

---

## 📅 Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| Clear cache | Harian/Saat update | `podman exec hafalan-app php artisan cache:clear` |
| Backup database | Harian | `podman exec hafalan-db-postgres pg_dump hafalan_db > backup.sql` |
| Update dependencies | Bulanan | `podman exec hafalan-app composer update` |
| Check logs | Harian | `podman-compose logs app` |
| Rebuild assets | Setiap update fitur | `npm run build` |

---

## 🚨 Emergency Commands

### **Restart Semua Services**
```bash
podman-compose down
podman-compose up -d
```

### **Clear Semua Cache Agresif**
```bash
podman exec hafalan-app php artisan cache:forget app
podman exec hafalan-app php artisan config:clear
podman exec hafalan-app php artisan view:clear
podman exec hafalan-app php artisan route:clear
podman exec hafalan-app php artisan config:cache
```

### **Reset Database Migrations (HATI-HATI!)**
```bash
# BACKUP DULU!
podman exec hafalan-db-postgres pg_dump hafalan_db > backup_before_reset.sql

# Rollback semua
podman exec hafalan-app php artisan migrate:reset

# Re-run fresh
podman exec hafalan-app php artisan migrate
```

### **Rebuild Frontend dari Scratch**
```bash
podman exec hafalan-app sh -c "rm -rf /var/www/html/node_modules && npm install && npm run build"
```

---

## 📝 Notes

- **Environment**: Production (Podman)
- **Framework**: Laravel 11 + React + Vite
- **Database**: PostgreSQL 15
- **Web Server**: Nginx
- **Reverse Proxy**: Traefik
- **SSL**: Cloudflare

---

## 👤 Support

Jika ada error atau masalah:
1. Cek logs: `podman-compose logs app`
2. Troubleshooting section di atas
3. Cek git status: `git status`
4. Cek .env config: `cat .env`

Last updated: 2025-11-06
