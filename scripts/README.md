# 📝 Hafalan Scripts Documentation

Folder ini berisi automation scripts untuk maintenance dan deployment Hafalan.

## 📚 Available Scripts

### 1. `update-backend.sh` - Backend Update
**Kapan digunakan:** Update Laravel code, Controller, Model, Routes, Database

```bash
./scripts/update-backend.sh
```

**Yang dilakukan:**
- Pull latest code dari Git
- Install Composer dependencies
- Run database migrations
- Clear caches (config, routes, cache)

**Durasi:** 2-5 menit

**Contoh kasus:**
- Add/update API endpoint
- Update database schema
- Fix backend bugs
- Add new validation rules

---

### 2. `update-frontend.sh` - Frontend Update
**Kapan digunakan:** Update React components, CSS, JavaScript, Assets

```bash
./scripts/update-frontend.sh
```

**Yang dilakukan:**
- Pull latest code dari Git
- Install npm dependencies
- Fix node_modules permissions
- Build assets dengan Vite
- Clear caches

**Durasi:** 3-7 menit

**Contoh kasus:**
- Update React component
- Change styling/CSS
- Update JavaScript logic
- Add new UI feature

---

### 3. `update-full.sh` - Full Stack Update
**Kapan digunakan:** Update backend + frontend + database sekaligus

```bash
./scripts/update-full.sh
```

**Yang dilakukan:**
- Pull latest code dari Git
- Install Composer + npm dependencies
- Run database migrations
- Build frontend assets
- Clear all caches

**Durasi:** 5-15 menit

**Contoh kasus:**
- Major feature release
- Unsure what changed - safe option
- Both backend and frontend updates

---

### 4. `cache-refresh.sh` - Quick Cache Clear
**Kapan digunakan:** Hanya clear cache, tanpa code changes

```bash
./scripts/cache-refresh.sh
```

**Yang dilakukan:**
- Clear config cache
- Clear application cache
- Clear routes cache
- Clear views cache

**Durasi:** < 1 menit

**Contoh kasus:**
- Perubahan .env tidak terlihat
- Logo/gambar tidak terupdate
- Need quick cache refresh
- DEBUG: perubahan tidak terlihat

---

### 5. `troubleshoot.sh` - Diagnostics & Health Check
**Kapan digunakan:** Saat ada masalah atau ingin check kesehatan sistem

```bash
./scripts/troubleshoot.sh
```

**Yang diperiksa:**
- Container status
- Recent error logs
- Database connection
- Environment variables
- Disk space
- Git status
- Build artifacts
- Node modules permissions

**Contoh kasus:**
- Website tidak bisa diakses
- Error tidak jelas dari browser
- Ingin check overall health
- Debugging masalah kompleks

---

## 🚀 Usage Examples

### Contoh 1: Update Backend
```bash
cd /home/robby/stacks/prod/hafalan
./scripts/update-backend.sh
# Tunggu selesai, cek browser
```

### Contoh 2: Update Frontend
```bash
cd /home/robby/stacks/prod/hafalan
./scripts/update-frontend.sh
# Hard refresh browser (Ctrl+F5)
# Verifikasi perubahan UI
```

### Contoh 3: Troubleshooting
```bash
cd /home/robby/stacks/prod/hafalan
./scripts/troubleshoot.sh
# Lihat diagnostics output
# Follow recommendations
```

### Contoh 4: Daily Maintenance
```bash
# Check status
podman-compose ps

# Clear cache if needed
./scripts/cache-refresh.sh

# Backup database
podman exec hafalan-db-postgres pg_dump hafalan_db > backups/$(date +%Y%m%d).sql
```

---

## ⚙️ Technical Details

### Prerequisites
- Podman installed and running
- Containers running: `hafalan-app`, `hafalan-db-postgres`, `hafalan-web`
- Git repository initialized

### Environment
- PHP 8.2
- Laravel 11
- Node.js 18+
- PostgreSQL 15
- Vite for asset bundling

### Container Names
- `hafalan-app` - PHP-FPM backend
- `hafalan-db-postgres` - PostgreSQL database
- `hafalan-web` - Nginx web server

---

## 🔐 Safety Measures

Scripts include:
- `set -e` - Stop on first error
- Automatic permission fixes
- Clean error messages
- Progress indicators
- Helpful next steps

### Before using scripts:
1. Ensure containers are running: `podman-compose ps`
2. Have git credentials ready
3. Know what changes are being deployed

### After using scripts:
1. Check browser: https://hafalan.humahub.my.id
2. Verify console (F12) - no JS errors
3. Test key features
4. Check logs if issues: `podman-compose logs app`

---

## 🐛 Troubleshooting Script Issues

### Script not executable
```bash
chmod +x /home/robby/stacks/prod/hafalan/scripts/*.sh
```

### Permission denied on build
```bash
podman exec hafalan-app sh -c "chmod -R 755 node_modules"
```

### Container not found
```bash
podman-compose up -d
podman-compose ps
```

### Git issues
```bash
git status
git log --oneline -5
git diff HEAD
```

---

## 📊 Performance Tips

1. **Run during low-traffic hours** - minimize impact
2. **Monitor logs while running** - catch issues early
   ```bash
   # In another terminal
   podman-compose logs -f app
   ```
3. **Clear cache only when needed** - not on every deploy
4. **Backup before migrations** - always!
   ```bash
   podman exec hafalan-db-postgres pg_dump hafalan_db > backup.sql
   ```

---

## 📞 When to use which script

| Scenario | Script | Time |
|----------|--------|------|
| Update Laravel code only | `update-backend.sh` | 2-5 min |
| Update React/CSS only | `update-frontend.sh` | 3-7 min |
| Both backend & frontend | `update-full.sh` | 5-15 min |
| Logo/static file changed | `cache-refresh.sh` | < 1 min |
| Troubleshoot issues | `troubleshoot.sh` | < 1 min |

---

## 📝 Script Internals

Each script:
1. Sets `set -e` for error handling
2. Echoes progress with emojis
3. Executes commands via `podman exec`
4. Clears appropriate caches
5. Shows completion status
6. Provides next steps

### Manual equivalent examples:

**update-backend.sh equivalent:**
```bash
git pull origin main
podman exec hafalan-app composer install --no-dev
podman exec hafalan-app php artisan migrate --force
podman exec hafalan-app php artisan config:cache
podman exec hafalan-app php artisan cache:clear
```

**update-frontend.sh equivalent:**
```bash
git pull origin main
podman exec hafalan-app npm install
podman exec hafalan-app sh -c "chmod -R 755 node_modules/.bin && chmod -R 755 node_modules/@esbuild"
podman exec hafalan-app sh -c "cd /var/www/html && NODE_ENV=production node ./node_modules/vite/bin/vite.js build"
podman exec hafalan-app php artisan cache:clear
```

---

## 📚 Related Documentation

- `MAINTENANCE_GUIDE.md` - Detailed maintenance guide
- `QUICK_MAINTENANCE.md` - Quick reference card
- `.env` - Environment configuration
- `podman-compose.yaml` - Container configuration

---

**Last Updated:** 2025-11-06  
**Location:** `/home/robby/stacks/prod/hafalan/scripts/`  
**Maintained by:** Hafalan DevOps
