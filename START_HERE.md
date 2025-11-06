# 🎯 START HERE - Hafalan Maintenance & Deployment Guide

Welcome to the Hafalan maintenance documentation! Start with this file.

---

## 📚 Documentation Index

### For Quick Operations (< 5 minutes)
1. **`QUICK_MAINTENANCE.md`** ⭐ **START HERE**
   - Quick command reference
   - What to run when
   - Emergency commands
   - 3-minute read

### For Comprehensive Information
2. **`MAINTENANCE_GUIDE.md`**
   - Detailed workflows
   - Troubleshooting guide
   - Container information
   - Monitoring & logs
   - 15-minute read

### For Automation Scripts
3. **`scripts/README.md`**
   - Script documentation
   - Usage examples
   - When to use each script
   - Technical details

---

## 🚀 Get Started in 3 Steps

### Step 1: Understand Your Setup
```bash
cd /home/robby/stacks/prod/hafalan

# Check current status
podman-compose ps

# This should show 3 containers running:
# - hafalan-app (PHP backend)
# - hafalan-db-postgres (Database)
# - hafalan-web (Nginx)
```

### Step 2: Choose Your Scenario

**Backend Update Only?** (Laravel code/database)
```bash
./scripts/update-backend.sh
```

**Frontend Update Only?** (React/CSS/JS)
```bash
./scripts/update-frontend.sh
```

**Both Backend & Frontend?**
```bash
./scripts/update-full.sh
```

**Logo/Static Files Only?**
```bash
./scripts/cache-refresh.sh
```

### Step 3: Verify Changes
- Open browser: https://hafalan.humahub.my.id
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Check console: `F12` for errors

---

## 📋 Quick Reference

### Most Common Commands

| Task | Command |
|------|---------|
| Update backend | `./scripts/update-backend.sh` |
| Update frontend | `./scripts/update-frontend.sh` |
| Update everything | `./scripts/update-full.sh` |
| Clear cache | `./scripts/cache-refresh.sh` |
| Check health | `./scripts/troubleshoot.sh` |
| View logs | `podman-compose logs -f app` |
| Restart all | `podman-compose restart` |

### When Something Goes Wrong

```bash
# 1. Check what's happening
./scripts/troubleshoot.sh

# 2. View error logs
podman-compose logs app

# 3. Try these fixes
./scripts/cache-refresh.sh        # Clear cache
podman-compose restart             # Restart containers
./scripts/update-full.sh           # Full rebuild (if stuck)
```

---

## 🔄 Typical Workflow

### For Adding a New Feature

```bash
# 1. Pull code from git
git pull origin main

# 2. If changes are backend only
./scripts/update-backend.sh

# 2. If changes are frontend only
./scripts/update-frontend.sh

# 2. If not sure
./scripts/update-full.sh

# 3. Test in browser
# Visit: https://hafalan.humahub.my.id
# Hard refresh: Ctrl+F5
# Check console: F12
```

### For Changing Logo/Static Files

```bash
# 1. Copy new files to public/ folder
cp /path/to/new/logo.svg public/logo.svg

# 2. Clear cache
./scripts/cache-refresh.sh

# 3. Hard refresh browser (Ctrl+F5)
```

### For Environment Variable Changes

```bash
# 1. Edit .env
nano .env
# Make changes and save

# 2. Clear cache and restart
./scripts/cache-refresh.sh
podman-compose restart app

# 3. Verify in browser
```

---

## 🎯 Recommended Reading Order

1. **This file** (5 min) - Overview
2. **`QUICK_MAINTENANCE.md`** (5 min) - Quick reference
3. **`MAINTENANCE_GUIDE.md`** (15 min) - Deep dive
4. **`scripts/README.md`** (10 min) - Scripts details

Total time: ~35 minutes to fully understand everything

---

## 📍 File Locations

```
/home/robby/stacks/prod/hafalan/
├── START_HERE.md              ← You are here
├── MAINTENANCE_GUIDE.md       ← Comprehensive guide
├── QUICK_MAINTENANCE.md       ← Quick reference
├── .env                        ← Configuration
├── podman-compose.yaml         ← Container config
├── scripts/
│   ├── README.md              ← Scripts docs
│   ├── update-backend.sh
│   ├── update-frontend.sh
│   ├── update-full.sh
│   ├── cache-refresh.sh
│   └── troubleshoot.sh
├── app/                        ← Laravel application
├── resources/                  ← React components
├── public/                     ← Static files
└── public/build/               ← Built assets
```

---

## 💡 Key Concepts

### 1. **Podman vs Docker**
We use Podman (not Docker). All commands use `podman-compose` and `podman exec`.

### 2. **Containers**
- **hafalan-app**: PHP-FPM running Laravel
- **hafalan-db-postgres**: PostgreSQL database
- **hafalan-web**: Nginx web server

### 3. **Build Process**
- Backend: Laravel (no build needed)
- Frontend: React code → Vite builds → assets in `public/build/`

### 4. **Caching Layers**
- Browser cache (clear with Ctrl+F5)
- Laravel config cache (clear with script)
- Database cache (clear with script)
- Nginx cache (managed by Traefik)

### 5. **The Problem We Fixed**
Logo and .env changes weren't showing because:
- Browser cache wasn't cleared
- Laravel config cache wasn't regenerated
- Vite assets weren't rebuilt
- All 3 needed to be cleared simultaneously

---

## ⚡ Emergency Commands

If something breaks:

```bash
# Option 1: Just clear cache
./scripts/cache-refresh.sh

# Option 2: Full update
./scripts/update-full.sh

# Option 3: Restart everything
podman-compose down && podman-compose up -d

# Option 4: Check what's wrong
./scripts/troubleshoot.sh
```

---

## 🔐 Safety Tips

1. **Always backup before migrations:**
   ```bash
   podman exec hafalan-db-postgres pg_dump hafalan_db > backup.sql
   ```

2. **Test changes locally first** before production

3. **Read git changes before pulling:**
   ```bash
   git diff HEAD origin/main
   ```

4. **Keep these scripts in git** for version control

5. **Watch logs while deploying:**
   ```bash
   podman-compose logs -f app
   ```

---

## 🤔 Frequently Asked Questions

### Q: How often should I clear cache?
**A:** Only when needed - after updates. Not every day.

### Q: What if update fails?
**A:** Run `./scripts/troubleshoot.sh` to diagnose, then check logs with `podman-compose logs app`.

### Q: Should I restart containers after every update?
**A:** Only if having issues. Scripts usually don't need it.

### Q: How long do updates take?
**A:** Backend: 2-5 min | Frontend: 3-7 min | Both: 5-15 min

### Q: Can I run scripts simultaneously?
**A:** No, run them one at a time and wait for completion.

### Q: Do I need to commit scripts to git?
**A:** Yes, keep them in version control for consistency.

---

## 📞 When in Doubt

```bash
# Run this first
./scripts/troubleshoot.sh

# Then read
cat MAINTENANCE_GUIDE.md

# Check logs
podman-compose logs app
```

---

## ✅ Checklist Before First Deployment

- [ ] Read this file (START_HERE.md)
- [ ] Read QUICK_MAINTENANCE.md
- [ ] Understand the 5 scripts
- [ ] Run `./scripts/troubleshoot.sh` once
- [ ] Know where logs are
- [ ] Have backup plan
- [ ] Know how to rollback
- [ ] Have git access ready

---

## 🚀 You're Ready!

You now have:
- ✅ Automated scripts for updates
- ✅ Comprehensive documentation
- ✅ Troubleshooting guides
- ✅ Quick reference materials
- ✅ Container monitoring
- ✅ Cache management

**Next step:** Read `QUICK_MAINTENANCE.md` for quick reference!

---

**Last Updated:** 2025-11-06  
**Environment:** Production (Podman)  
**Framework:** Laravel 11 + React + Vite  
**Containers:** 3 (App, Database, Web)

