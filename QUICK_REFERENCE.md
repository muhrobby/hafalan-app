# Quick Reference - Perbaikan Deployment Hafalan

## 🎯 Ringkasan Masalah & Solusi

### 1️⃣ CSS/JS MIME Type Error
**Masalah:** Browser menolak CSS/JS karena dikirim sebagai HTML  
**Penyebab:** Nginx mengirim `/build/assets` ke PHP handler  
**Solusi:** Tambah location block khusus di Nginx SEBELUM catch-all route

```nginx
location ~ ^/build/assets/.*\.(css|js)$ {
    types { text/css css; application/javascript js; }
    try_files $uri =404;
}
location /build/ { try_files $uri =404; }
location / { try_files $uri $uri/ /index.php?$query_string; }  # SETELAH static blocks
```

---

### 2️⃣ Build Assets Tidak Ada
**Masalah:** File CSS/JS tidak ada di `/public/build/assets/`  
**Penyebab:** Volume mount dari host kosong mengoverride Docker artifacts  
**Solusi:** Build di container, copy ke host
```bash
podman exec hafalan-app npm run build
podman cp hafalan-app:/var/www/html/public/build/. public/build/
```

---

### 3️⃣ Cloudflare Cache Lama
**Masalah:** Dengan query param `?cb=123` works, tanpa query param masih 404  
**Penyebab:** Cloudflare cache old 404 responses  
**Solusi:** 
- **Option A:** Login Cloudflare → Purge Cache → Purge Everything
- **Option B:** Wait 4 hours untuk natural expiration
- **Option C:** Use cache buster query params

---

### 4️⃣ Dashboard 500 Error
**Masalah:** `/dashboard` crash dengan SQL error  
**Penyebab:** PostgreSQL double quotes untuk string literal (`"Tidak ada Kelas"`)  
**Solusi:** Ubah ke single quotes
```php
// ❌ WRONG
->selectRaw('COALESCE(classes.name, "Tidak ada Kelas") as class_name')

// ✅ CORRECT  
->selectRaw("COALESCE(classes.name, 'Tidak ada Kelas') as class_name")
```
**Files:** `/app/Http/Controllers/AnalyticsController.php` (2 lokasi: line 86, 184)

---

### 5️⃣ 502 Bad Gateway on Refresh
**Masalah:** Random 502 errors ketika refresh page dengan data banyak  
**Penyebab:** Nginx FastCGI buffer terlalu kecil untuk response header besar  
**Error:** `upstream sent too big header while reading response header from upstream`  
**Solusi:** Increase buffer size di Nginx
```nginx
fastcgi_buffer_size 128k;
fastcgi_buffers 4 256k;
fastcgi_busy_buffers_size 256k;
```

---

### 6️⃣ Browser Cache Lama Asset
**Masalah:** Browser cari file lama (e.g., `app-BPNhMYNs.js`) yang tidak exist  
**Penyebab:** Browser cache old manifest.json, file beda di rebuild baru  
**Solusi User:** Hard refresh browser (Ctrl+Shift+R)  
**Solusi App:** Add dynamic version di middleware
```php
// HandleInertiaRequests.php
public function version(Request $request): ?string
{
    return md5_file(public_path('build/manifest.json')) ?: date('YmdHis');
}
```

---

## 📋 Modified Files Checklist

```
✅ docker/nginx/default.conf
   - Location blocks untuk /build/assets
   - FastCGI buffer configuration
   - Correct order: static SEBELUM catch-all

✅ podman-compose.yaml
   - Traefik route untuk /build/ assets  
   - Asset-specific cache middleware
   - Volume mount ./public/build

✅ app/Http/Controllers/AnalyticsController.php
   - Line 86: Fix double quotes
   - Line 184: Fix double quotes

✅ app/Http/Middleware/HandleInertiaRequests.php
   - Dynamic asset versioning
```

---

## 🧪 Testing Commands

```bash
# Test CSS loading
curl -I https://hafalan.humahub.my.id/build/assets/app-GNLSjkBZ.css
# Expected: HTTP 200, Content-Type: text/css

# Test multiple requests (502 check)
for i in {1..10}; do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" https://hafalan.humahub.my.id/dashboard
done

# Check Nginx logs
podman logs hafalan-web 2>&1 | tail -20

# Check PHP logs
podman logs hafalan-app 2>&1 | tail -20

# Verify assets in container
podman exec hafalan-web ls /var/www/html/public/build/assets/ | wc -l
```

---

## 🚀 Status: PRODUCTION READY ✅

- ✅ All assets loading correctly
- ✅ No SQL errors
- ✅ No 502 errors
- ✅ Proper cache headers
- ✅ Asset versioning implemented

---

## 💡 Prevention Tips

1. **Order matters:** Static location blocks HARUS sebelum catch-all `/`
2. **SQL Quotes:** Single quotes untuk string, double untuk identifiers di PostgreSQL
3. **Buffer Monitoring:** Watch Nginx logs untuk `upstream sent too big header`
4. **Asset Versioning:** Implement selalu untuk prevent old cache issues
5. **Test Data Volume:** Reload test dengan realistic data size

---

## 📞 Troubleshooting

**Q: Masih ada 404 di browser tapi curl works?**  
A: Clear browser cache atau hard refresh (Ctrl+Shift+R)

**Q: 502 error tapi status OK di logs?**  
A: Increase FastCGI buffer size, reload Nginx

**Q: CSS loading tapi styling not applied?**  
A: Purge Cloudflare cache atau wait 4 hours

**Q: Dashboard crash?**  
A: Check SQL queries untuk quote syntax (double vs single)

---

Dokumentasi lengkap: `DEPLOYMENT_FIX_DOCUMENTATION.md`
