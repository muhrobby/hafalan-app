# Deployment Flow Diagram

## 📊 Complete Deployment Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LOCAL DEVELOPMENT                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Create Branch (optional)                                               │
│     └─ git checkout -b feature/your-feature                                │
│                                                                              │
│  2. Make Code Changes                                                       │
│     ├─ Edit PHP files (app/Http/Controllers/*)                             │
│     ├─ Edit React components (resources/js/*)                              │
│     ├─ Edit CSS (resources/css/*)                                          │
│     └─ Create migrations (if needed)                                        │
│                                                                              │
│  3. Test Locally                                                            │
│     ├─ php artisan test                                                     │
│     ├─ npm run build (if frontend changes)                                  │
│     └─ php artisan serve (if developing locally)                            │
│                                                                              │
│  4. Commit with Clear Message                                              │
│     └─ git commit -m "feat: Clear description of changes"                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRE-DEPLOYMENT CHECK                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ☑️  Review all changes: git diff origin/main...HEAD                        │
│  ☑️  Run tests: php artisan test                                            │
│  ☑️  Check migrations: php artisan migrate --dry-run                        │
│  ☑️  Build assets: npm run build                                            │
│  ☑️  Decision: Which deployment method to use?                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
        ┌───────────────────────┐    ┌───────────────────────┐
        │  Simple Deployment    │    │  Database Migration   │
        │  (CSS/JS/Minor Fix)   │    │  (Structural Changes) │
        │  Risk: LOW            │    │  Risk: HIGH           │
        │  Time: 2-5 min        │    │  Time: 5-15 min       │
        └───────────────────────┘    └───────────────────────┘
                    ↓                               ↓
        ┌───────────────────────────────┐  ┌──────────────────────────┐
        │ 1. git push origin main        │  │ 1. Create DB backup      │
        │ 2. git pull on production      │  │ 2. git push              │
        │ 3. npm run build               │  │ 3. git pull              │
        │ 4. cache:clear                 │  │ 4. npm run build         │
        │ 5. nginx reload                │  │ 5. php artisan migrate   │
        │ 6. Verify                      │  │ 6. cache:clear           │
        └───────────────────────────────┘  │ 7. Verify                │
                                            └──────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                      POST-DEPLOYMENT VERIFICATION                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ✅ Health Checks:                                                          │
│     ├─ Homepage loads (HTTP 200/302)                                        │
│     ├─ CSS assets load (HTTP 200, Content-Type: text/css)                   │
│     ├─ JS assets load (HTTP 200, Content-Type: application/javascript)      │
│     ├─ API endpoints accessible                                             │
│     ├─ Database queries work                                                │
│     └─ Stress test (10 requests, no 502)                                    │
│                                                                              │
│  🔍 Manual Checks:                                                          │
│     ├─ No errors in podman logs hafalan-app                                 │
│     ├─ No errors in podman logs hafalan-web                                 │
│     ├─ Browser console clean (no 404s)                                      │
│     ├─ CSS/JS MIME types correct                                            │
│     └─ Database connection working                                          │
│                                                                              │
│  ✓ Approval: All checks passed?                                             │
│     YES ─→ Deployment Complete! ✅                                          │
│     NO  ─→ Go to Troubleshooting                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
                            ┌─────────────┐
                            │  SUCCESS ✅  │
                            │ Monitor for │
                            │  10 min to  │
                            │  ensure no  │
                            │  issues     │
                            └─────────────┘
```

---

## 🔄 Rollback Decision Tree

```
                    DEPLOYMENT ISSUE DETECTED
                             ↓
                    ┌─────────────────────┐
                    │ What's the issue?   │
                    └────┬────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    500 ERROR        502 ERROR          404 ERROR
        │                │                │
        │                │                │
    ┌───┴──────┐     ┌───┴──────┐    ┌───┴──────┐
    │ Check    │     │ Clear    │    │ Check    │
    │ PHP logs │     │ Cache &  │    │ Assets   │
    │ Check    │     │ Reload   │    │ Rebuild  │
    │ Database │     │ Nginx    │    │ or       │
    │          │     │          │    │ Purge CF │
    └────┬─────┘     └────┬─────┘    └────┬─────┘
         │                 │              │
         ├─ FIXED? ✅     ├─ FIXED? ✅   ├─ FIXED? ✅
         │  DONE!          │  DONE!        │  DONE!
         │                 │              │
         NO→ NEXT STEP     NO→ NEXT STEP  NO→ NEXT STEP
         ↓                 ↓              ↓
         
    git log --oneline  git logs check    Check Nginx
    Find last commit   PHP-FPM running   config
    git revert HEAD    Check buffers     Restart web
    Push & restart     Restart app       Verify

    Still NO? ↓
    ┌─────────────────────────────────┐
    │ FULL ROLLBACK PROCEDURE          │
    ├─────────────────────────────────┤
    │ 1. Restore from DB backup       │
    │ 2. git reset --hard <old-hash>  │
    │ 3. npm run build                │
    │ 4. podman-compose restart       │
    │ 5. Verify                       │
    │ 6. Post-mortem investigation    │
    └─────────────────────────────────┘
         ↓
    ✅ SERVICE RESTORED
```

---

## 📝 Deployment Checklist Template

```
DEPLOYMENT CHECKLIST - [DATE] - [VERSION/COMMIT]
═══════════════════════════════════════════════════════════════

PRE-DEPLOYMENT:
  ☐ Code changes reviewed
  ☐ All tests passing
  ☐ Migrations reviewed (dry-run if applicable)
  ☐ Database backup created (if migrations)
  ☐ Team notified of changes
  ☐ Deployment method decided

DEPLOYMENT EXECUTION:
  ☐ git pull origin main
  ☐ npm run build (if frontend changes)
  ☐ php artisan migrate (if migrations)
  ☐ php artisan cache:clear
  ☐ php artisan config:cache
  ☐ podman-compose restart app web (if needed)
  ☐ nginx -s reload (if config changes)

POST-DEPLOYMENT VERIFICATION:
  ☐ Homepage loads (HTTP 200/302)
  ☐ CSS assets load correctly
  ☐ JavaScript assets load correctly
  ☐ No console errors in browser
  ☐ API endpoints working
  ☐ Database connection verified
  ☐ Stress test passed (10+ requests)
  ☐ Logs checked for errors

SIGN-OFF:
  ☐ Deployment successful
  ☐ Monitored for 10+ minutes
  ☐ No ongoing issues
  
Deployed by: ____________  Date: ____________  Time: ____________
```

---

## 🚨 Emergency Procedures

### Quick Fix Priority Order

```
PRIORITY 1 (CRITICAL - DO IMMEDIATELY):
├─ Website returning 500 errors
├─ Website returning 502 errors
├─ Database offline/unreachable
└─ Data corruption detected

→ ACTION: Check logs → Quick fix attempt (2 min) → If fails → ROLLBACK

PRIORITY 2 (HIGH - DO QUICKLY):
├─ Assets not loading (404)
├─ Page partially broken
├─ Specific feature broken
└─ Performance degradation

→ ACTION: Investigate (5 min) → Fix or Rollback

PRIORITY 3 (MEDIUM - MONITOR):
├─ Minor UI issues
├─ Typos/formatting
├─ Non-critical warnings in logs
└─ Intermittent issues

→ ACTION: Monitor → Schedule fix in next deployment
```

### "Break Glass" Rollback (Last Resort)

```bash
# If everything is broken and nothing works:

#!/bin/bash
cd /home/robby/stacks/prod/hafalan

# 1. Get last known good commit
LAST_GOOD=$(git log --oneline | head -5 | tail -1 | cut -d' ' -f1)

# 2. Hard reset to last good commit
git reset --hard $LAST_GOOD
git push origin main --force

# 3. Rebuild
npm run build

# 4. Restart everything
podman-compose down
podman-compose up -d

# 5. Wait and verify
sleep 10
curl -I https://hafalan.humahub.my.id/

# If still broken, restore database:
podman exec hafalan-db-postgres pg_restore \
  -U hafalan_user \
  -d hafalan_db \
  -v $(ls -t /tmp/hafalan_backup_*.dump | head -1)
```

---

## 📱 Monitoring After Deployment

```
DEPLOYMENT COMPLETE
↓
START: 5-10 MINUTE MONITORING WINDOW
│
├─ Check system logs every 1 minute
│  └─ podman logs hafalan-app | tail -20
│  └─ podman logs hafalan-web | tail -20
│
├─ Check error rate
│  └─ Count 502/500 errors in Nginx logs
│  └─ No errors = ✅ Good
│
├─ Check performance
│  └─ Response time reasonable?
│  └─ CPU/Memory usage normal?
│
├─ Manual testing
│  └─ Click around the app
│  └─ Try key features changed in this deployment
│
├─ User feedback
│  └─ Any complaints from users?
│  └─ Issues reported on Slack?
│
└─ AFTER 10 MINUTES:
   ├─ No issues? → ✅ DEPLOYMENT SUCCESSFUL
   └─ Issues found? → 🚨 INVESTIGATE/ROLLBACK
```

---

## 🔗 Related Documents

- **DEPLOYMENT_FIX_DOCUMENTATION.md** - Details on issues we fixed
- **QUICK_REFERENCE.md** - Quick reference for common problems
- **QUICK_START.md** - Getting started guide
- **README.md** - Project overview

---

**Last Updated:** 3 November 2025  
**Status:** Ready to Use  
**Version:** 1.0
