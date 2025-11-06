# 🚀 Quick Start - Hafalan Maintenance Commands

Dokumentasi cepat untuk operasi maintenance paling sering digunakan.

## ⚡ Super Quick Reference

```bash
# Update hanya BACKEND (Laravel code/database)
./scripts/update-backend.sh

# Update hanya FRONTEND (React/CSS/JS)
./scripts/update-frontend.sh

# Update SEMUA (Backend + Frontend + Database)
./scripts/update-full.sh

# Clear cache only (tanpa update code)
./scripts/cache-refresh.sh

# Troubleshooting & diagnostics
./scripts/troubleshoot.sh
```

---

## 📋 What to Run When?

### Scenario 1: Update Controller/Route/Model
```bash
./scripts/update-backend.sh
```

### Scenario 2: Update React Component/CSS/JS
```bash
./scripts/update-frontend.sh
```

### Scenario 3: Update Database Schema
```bash
./scripts/update-backend.sh
```

### Scenario 4: Logo/Static Files Change
```bash
./scripts/cache-refresh.sh
# Then hard refresh browser (Ctrl+F5)
```

### Scenario 5: Changes di .env (APP_NAME, etc)
```bash
./scripts/cache-refresh.sh
# Or restart container:
podman-compose restart app
```

### Scenario 6: Not sure what changed
```bash
./scripts/update-full.sh  # Safe option
```

---

## 🔍 Debugging

**Perubahan tidak terlihat?**
```bash
./scripts/cache-refresh.sh
# Then: Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
```

**Container not working?**
```bash
podman-compose ps              # Check status
podman-compose logs app        # See errors
podman-compose restart         # Restart all
```

**Need diagnostics?**
```bash
./scripts/troubleshoot.sh
```

---

## 📊 Container Commands

```bash
# View all containers
podman-compose ps

# Restart everything
podman-compose restart

# Stop all
podman-compose down

# Start all
podman-compose up -d

# View logs
podman-compose logs app -f    # Follow app logs in real-time
podman-compose logs db        # Database logs
podman-compose logs web       # Nginx logs
```

---

## 🔐 Important Notes

1. **Always backup before migrations:**
   ```bash
   podman exec hafalan-db-postgres pg_dump hafalan_db > backup.sql
   ```

2. **Test changes locally first** before production

3. **Keep git commits organized** - one feature per commit

4. **Clear browser cache** after updates (Ctrl+F5)

5. **Check logs** if something breaks: `podman-compose logs app`

---

## 📞 Emergency Commands

**Hard reset (DESTRUCTIVE - BACKUP FIRST!):**
```bash
# Complete reset
podman-compose down -v  # Remove volumes too
podman-compose up -d
```

**If database is stuck:**
```bash
podman-compose restart db
podman exec hafalan-app php artisan migrate
```

**If build fails:**
```bash
podman exec hafalan-app sh -c "chmod -R 755 node_modules"
./scripts/update-full.sh
```

---

## 💡 Pro Tips

1. **Run before bed/off-hours** - deployments are safer when monitored
2. **Keep terminal open** - watch logs: `podman-compose logs -f app`
3. **Backup often** - database backups are quick
4. **Read git diff** before pulling - know what's changing
5. **Test in browser** immediately after - catch issues early

---

**Last Updated:** 2025-11-06  
**Environment:** Production (Podman)  
**Framework:** Laravel 11 + React + Vite  

More details: See `MAINTENANCE_GUIDE.md`
