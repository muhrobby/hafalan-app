# 📊 Panduan Upload Excel - Santri & Wali

## 🎯 Fitur Upload Excel Combo Santri + Wali

Fitur ini memungkinkan admin untuk **upload data santri beserta wali mereka sekaligus** menggunakan file Excel. Satu baris di Excel akan membuat:

- 1 Santri
- 1 Wali (atau menggunakan wali yang sudah ada jika email sama)
- Relasi antara santri dan wali

---

## 📥 Cara Menggunakan

### 1. Download Template Excel

1. Login sebagai **Admin**
2. Buka halaman **Santri**
3. Klik tombol **"Upload Excel"** (icon Excel hijau)
4. Di modal yang muncul, klik **"Download Template"**
5. File `template_santri_wali.xlsx` akan terdownload

### 2. Isi Template Excel

Template berisi kolom-kolom berikut:

| Kolom              | Wajib?      | Format     | Contoh                   | Keterangan                             |
| ------------------ | ----------- | ---------- | ------------------------ | -------------------------------------- |
| **nama_santri**    | ✅ Wajib    | Teks       | Ahmad Fauzi              | Nama lengkap santri                    |
| **tanggal_lahir**  | ✅ Wajib    | YYYY-MM-DD | 2010-01-15               | Format: Tahun-Bulan-Tanggal            |
| **telepon_santri** | ❌ Opsional | Angka      | 081234567890             | No HP santri (boleh kosong)            |
| **email_santri**   | ❌ Opsional | Email      | ahmad@example.com        | Email santri (boleh kosong)            |
| **nis**            | ❌ Opsional | Teks       | STD001                   | NIS santri (auto-generate jika kosong) |
| **alamat_santri**  | ❌ Opsional | Teks       | Jl. Merdeka No. 10       | Alamat lengkap santri                  |
| **nama_wali**      | ✅ Wajib    | Teks       | Budi Santoso             | Nama lengkap wali                      |
| **email_wali**     | ✅ Wajib    | Email      | budi.santoso@example.com | Email wali (harus unik)                |
| **telepon_wali**   | ✅ Wajib    | Angka      | 081234567891             | No HP wali                             |
| **alamat_wali**    | ❌ Opsional | Teks       | Jl. Merdeka No. 10       | Alamat lengkap wali                    |

### 3. Contoh Data

```
nama_santri    | tanggal_lahir | telepon_santri | email_santri         | nis    | alamat_santri          | nama_wali      | email_wali             | telepon_wali | alamat_wali
Ahmad Fauzi    | 2010-01-15    | 081234567890   | ahmad@example.com    | STD001 | Jl. Merdeka No. 10     | Budi Santoso   | budi.santoso@gmail.com | 081234567891 | Jl. Merdeka No. 10
Fatimah Zahra  | 2011-05-20    | 081234567892   |                      | STD002 | Jl. Sudirman No. 25    | Siti Aminah    | siti.aminah@gmail.com  | 081234567893 | Jl. Sudirman No. 25
```

### 4. Upload File Excel

1. Setelah mengisi template, **Save** file Excel
2. Klik **"Pilih File Excel"** di modal
3. Pilih file Excel yang sudah diisi
4. Klik **"Upload"**
5. Tunggu proses selesai (akan ada notifikasi sukses/error)

---

## ⚠️ Validasi & Error Handling

### Validasi Otomatis

Sistem akan mengecek:

- ✅ Nama santri tidak boleh kosong
- ✅ Tanggal lahir harus diisi dan format valid
- ✅ Email santri harus format email yang benar (jika diisi)
- ✅ Email santri tidak boleh duplikat dengan user lain
- ✅ NIS tidak boleh duplikat (jika diisi)
- ✅ Nama wali tidak boleh kosong
- ✅ Email wali tidak boleh kosong dan harus format email yang benar
- ✅ Telepon wali tidak boleh kosong

### Jika Ada Error

Jika terdapat error saat upload, sistem akan menampilkan:

- **Baris berapa** yang error
- **Kolom apa** yang bermasalah
- **Pesan error** yang jelas

**Contoh Error:**

```
Baris 3: email_santri - Format email tidak valid
Baris 5: nama_wali - Nama wali harus diisi
Baris 7: email_wali - Email wali sudah terdaftar
```

---

## 🔄 Fitur Pintar

### 1. Auto-Generate NIS

Jika kolom `nis` dikosongkan, sistem akan otomatis generate NIS dengan format:

```
STD + Timestamp + Random Number
Contoh: STD2025110712345678901
```

### 2. Deteksi Wali Yang Sudah Ada

Jika **email_wali** sudah terdaftar di sistem:

- ❌ **TIDAK** akan membuat wali baru
- ✅ **AKAN** menggunakan wali yang sudah ada
- ✅ Santri akan di-link ke wali yang sudah ada

**Contoh Use Case:**

```
Baris 1: Ahmad Fauzi → wali: budi.santoso@gmail.com (create new wali)
Baris 2: Fatimah Zahra → wali: budi.santoso@gmail.com (pakai wali yang sudah ada)
```

Hasilnya: 2 santri, 1 wali (Budi Santoso punya 2 anak)

### 3. Default Password

- **Santri**: Password default `student123`
- **Wali**: Password default `password123`
- Admin dapat reset password via halaman masing-masing

### 4. Auto Role Assignment

- Santri otomatis dapat role **"student"**
- Wali otomatis dapat role **"guardian"**

---

## 📝 Tips & Best Practices

### ✅ DO (Lakukan)

- Gunakan template yang sudah disediakan
- Isi tanggal lahir dengan format `YYYY-MM-DD` (contoh: 2010-01-15)
- Pastikan email wali unik (tidak duplikat)
- Double-check data sebelum upload
- Backup data lama sebelum import besar

### ❌ DON'T (Jangan)

- Jangan ubah header kolom di template
- Jangan gunakan format tanggal DD/MM/YYYY atau MM/DD/YYYY
- Jangan upload file lebih dari 5MB (max file size)
- Jangan pakai email yang sudah terdaftar untuk santri baru

---

## 🎓 Use Cases

### Case 1: Upload Santri Baru dengan Wali Baru

```
Ahmad Fauzi    | 2010-01-15 | ... | budi.santoso@gmail.com
Fatimah Zahra  | 2011-05-20 | ... | siti.aminah@gmail.com
```

Hasil: 2 santri, 2 wali

---

### Case 2: Upload Santri dengan Wali Yang Sama

```
Ahmad Fauzi    | 2010-01-15 | ... | budi.santoso@gmail.com
Ali Rizky      | 2012-03-10 | ... | budi.santoso@gmail.com
```

Hasil: 2 santri, 1 wali (Budi Santoso sebagai wali keduanya)

---

### Case 3: Upload Santri dengan Wali Yang Sudah Ada di Database

Jika `budi.santoso@gmail.com` sudah ada di database:

```
Muhammad Hafiz | 2013-07-25 | ... | budi.santoso@gmail.com
```

Hasil: 1 santri baru di-link ke wali yang sudah ada (tidak create wali baru)

---

## 🛠️ Troubleshooting

### Problem: "Format email tidak valid"

**Solusi:** Pastikan email menggunakan format `nama@domain.com`

### Problem: "Email santri sudah terdaftar"

**Solusi:** Ganti email santri atau kosongkan (email santri opsional)

### Problem: "NIS sudah terdaftar"

**Solusi:** Ganti NIS atau kosongkan (akan auto-generate)

### Problem: "Email wali sudah terdaftar"

**Solusi:**

- Jika memang wali yang sama → TIDAK masalah (santri akan di-link ke wali yang ada)
- Jika wali baru → Ganti email wali

### Problem: "File terlalu besar"

**Solusi:** Pisah jadi beberapa file (max 5MB per file)

### Problem: "Tanggal lahir tidak valid"

**Solusi:** Gunakan format `YYYY-MM-DD` (contoh: 2010-01-15)

---

## 📞 Support

Jika mengalami masalah:

1. Cek error message yang ditampilkan
2. Pastikan mengikuti format template
3. Hubungi Admin sistem untuk bantuan lebih lanjut

---

## 🔐 Security

- Semua password di-hash dengan bcrypt
- Email verified otomatis di-set saat import
- Data divalidasi sebelum masuk database
- Transaction digunakan untuk ensure data consistency
