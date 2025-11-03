# 🚀 DEPLOY SIMPLE - Copy & Paste Commands

**JANGAN RIBET! Tinggal Copy-Paste step by step**

---

## 📋 SAAT PERTAMA KALI DEPLOY DARI LOCAL

### Di Laptop/Local:
```bash
git add .
git commit -m "feat: apa yang kamu ubah"
git push origin main
```

### Di VPS (Production Server):
```bash
cd /home/robby/stacks/prod/hafalan
```

---

## 🎯 DEPLOY (Ketik Commands INI Saja):

### COMMAND 1 - Pull Code Terbaru:
```bash
git pull origin main
```

### COMMAND 2 - Build Frontend:
```bash
podman exec hafalan-app npm run build
```

### COMMAND 3 - Copy Build ke Host:
```bash
podman cp hafalan-app:/var/www/html/public/build/assets public/build/assets && podman cp hafalan-app:/var/www/html/public/build/manifest.json public/build/manifest.json
```

### COMMAND 4 - Clear Cache:
```bash
podman exec hafalan-app php artisan cache:clear && podman exec hafalan-app php artisan config:cache
```

### COMMAND 5 - Reload Nginx:
```bash
podman exec hafalan-web nginx -s reload
```

### COMMAND 6 - Verifikasi (Test):
```bash
curl -I https://hafalan.humahub.my.id/
```

**Jika muncul `HTTP/2 200` atau `HTTP/2 302` = ✅ BERHASIL!**

---

## ⏱️ ESTIMASI WAKTU:
- Command 1: 5 detik
- Command 2: 15-20 detik
- Command 3: 5 detik
- Command 4: 5 detik
- Command 5: 2 detik
- Command 6: 2 detik

**TOTAL: ~40 detik sampai 1 menit**

---

## 📝 COPY-PASTE SEKALIGUS (Tercepat):
Jika mau semua sekaligus, copy-paste ini:

```bash
cd /home/robby/stacks/prod/hafalan && \
git pull origin main && \
podman exec hafalan-app npm run build && \
podman cp hafalan-app:/var/www/html/public/build/assets public/build/assets && \
podman cp hafalan-app:/var/www/html/public/build/manifest.json public/build/manifest.json && \
podman exec hafalan-app php artisan cache:clear && \
podman exec hafalan-app php artisan config:cache && \
podman exec hafalan-web nginx -s reload && \
echo "✅ DEPLOY SELESAI!" && \
curl -I https://hafalan.humahub.my.id/
```

---

## 🆘 JIKA ADA ERROR:

### Error 1: Build Failed
```bash
podman exec hafalan-app npm install
podman exec hafalan-app npm run build
```

### Error 2: Still Getting 404/500
```bash
podman exec hafalan-app php artisan cache:clear
podman exec hafalan-web nginx -s reload
```

### Error 3: CSS MIME Type Error (tapi build OK)
- Refresh browser dengan Ctrl+Shift+R
- atau tunggu 4 jam Cloudflare cache expire

### Error 4: Semuanya Rusak
```bash
git log --oneline -5
git reset --hard <commit-sebelum-error>
git push origin main
podman-compose restart app
```

---

## 📱 CARA TERMUDAH - Pakai Script Otomatis:

Simpan file ini sebagai `deploy.sh`:

```bash
#!/bin/bash
set -e

cd /home/robby/stacks/prod/hafalan

echo "📥 Pulling code..."
git pull origin main

echo "🔨 Building..."
podman exec hafalan-app npm run build

echo "📦 Copying assets..."
podman cp hafalan-app:/var/www/html/public/build/assets public/build/assets
podman cp hafalan-app:/var/www/html/public/build/manifest.json public/build/manifest.json

echo "🧹 Clearing cache..."
podman exec hafalan-app php artisan cache:clear
podman exec hafalan-app php artisan config:cache

echo "♻️  Reloading Nginx..."
podman exec hafalan-web nginx -s reload

echo "✅ DEPLOY COMPLETE!"
curl -I https://hafalan.humahub.my.id/

```

### Setup Script (hanya 1x):
```bash
chmod +x deploy.sh
```

### Setelah itu, deploy hanya perlu:
```bash
./deploy.sh
```

---

## ✅ CHECKLIST SETELAH DEPLOY:

- [ ] Ketik: `curl -I https://hafalan.humahub.my.id/` 
- [ ] Lihat response: HTTP 200 atau 302
- [ ] Buka browser ke: https://hafalan.humahub.my.id
- [ ] Tekan F12 (buka DevTools)
- [ ] Lihat Console tab - ada error merah?
  - Tidak ada = ✅ OK
  - Ada = cek JIKA ADA ERROR section

---

## 🎯 SUMMARY - LANGKAH PALING PENTING:

1. **Local:** `git push origin main`
2. **VPS:** `git pull origin main`
3. **VPS:** `podman exec hafalan-app npm run build`
4. **VPS:** Copy build artifacts (command 3)
5. **VPS:** Clear cache (command 4)
6. **VPS:** Reload nginx (command 5)
7. **VPS:** Verify (command 6)

**SELESAI!**

---

Pertanyaan? Lihat bagian yang sesuai di file ini atau panggil QUICK_REFERENCE.md
