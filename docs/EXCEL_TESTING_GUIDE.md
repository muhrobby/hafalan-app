# 🧪 Testing Guide - Excel Upload Features

## 📋 Overview

Guide ini akan membantu Anda menguji semua fitur Excel upload yang baru diimplementasikan:

1. ✅ Upload Excel Santri + Wali (Combo)
2. ✅ Upload Excel Guru
3. ✅ Upload Excel Wali

---

## 🎯 Pre-requisites

### 1. Login sebagai Admin

```
Email: admin@example.com (atau admin yang sudah ada)
Password: Password!123 (atau password admin Anda)
```

### 2. Pastikan Server Running

```bash
php artisan serve
# atau
npm run dev
```

---

## 📊 Test 1: Upload Excel Santri + Wali

### Step 1: Download Template

1. Login sebagai **Admin**
2. Navigate ke **Santri** page
3. Klik button **"Upload Excel"** (icon hijau FileSpreadsheet)
4. Klik **"Download Template"**
5. File `template_santri_wali.xlsx` akan terdownload

### Step 2: Isi Template Excel

Buka file Excel dan isi dengan data berikut:

| nama_santri   | tanggal_lahir | telepon_santri | email_santri          | nis    | alamat_santri | nama_wali    | email_wali            | telepon_wali | alamat_wali |
| ------------- | ------------- | -------------- | --------------------- | ------ | ------------- | ------------ | --------------------- | ------------ | ----------- |
| Ahmad Fadhil  | 2010-01-15    | 081234567890   | ahmad.fadhil@test.com | STD101 | Jl. Test 1    | Budi Santoso | budi.santoso@test.com | 081234567800 | Jl. Test 1  |
| Fatimah Zahra | 2011-05-20    | 081234567891   |                       | STD102 | Jl. Test 2    | Siti Aminah  | siti.aminah@test.com  | 081234567801 | Jl. Test 2  |
| Ali Rizki     | 2012-03-10    | 081234567892   |                       | STD103 | Jl. Test 3    | Budi Santoso | budi.santoso@test.com | 081234567800 | Jl. Test 1  |

**Note:** Baris ke-3 menggunakan wali yang sama dengan baris ke-1 (by email)

### Step 3: Upload File

1. Klik **"Pilih File Excel"**
2. Select file yang sudah diisi
3. Klik **"Upload"**

### Step 4: Verify Results

**Expected Success Message:**

```
✅ Data santri dan wali berhasil diimport!
```

**Verify in Database:**

```sql
-- Check students (should be 3)
SELECT * FROM profiles WHERE role_type = 'student' AND nis IN ('STD101', 'STD102', 'STD103');

-- Check guardians (should be 2, karena Budi Santoso shared)
SELECT * FROM profiles WHERE role_type = 'guardian';

-- Check relations (should be 3 rows)
SELECT gs.*,
       s.name as student_name,
       g.name as guardian_name
FROM guardian_student gs
JOIN profiles s ON gs.student_id = s.id
JOIN profiles g ON gs.guardian_id = g.id
WHERE s.nis IN ('STD101', 'STD102', 'STD103');
```

**Verify Login Credentials:**

```
Santri Login (if email provided):
- Email: ahmad.fadhil@test.com
- Password: student123

Wali Login:
- Email: budi.santoso@test.com
- Password: password123
```

---

## 👨‍🏫 Test 2: Upload Excel Guru

### Step 1: Download Template

1. Navigate ke **Guru** page
2. Klik button **"Upload Excel"** (icon hijau FileSpreadsheet)
3. Klik **"Download Template"**
4. File `template_guru.xlsx` akan terdownload

### Step 2: Isi Template Excel

| name                    | email                  | nip    | phone        | address               |
| ----------------------- | ---------------------- | ------ | ------------ | --------------------- |
| Ustadz Ahmad Fauzan     | ustadz.ahmad@test.com  | NIP101 | 081234567900 | Jl. Pendidikan No. 15 |
| Ustadzah Siti Nurhaliza | ustadzah.siti@test.com | NIP102 | 081234567901 | Jl. Guru No. 20       |
| Ustadz Budi Prasetyo    | ustadz.budi@test.com   | NIP103 | 081234567902 | Jl. Ilmu No. 10       |

### Step 3: Upload File

1. Klik **"Pilih File Excel"**
2. Select file yang sudah diisi
3. Klik **"Upload"**

### Step 4: Verify Results

**Expected Success Message:**

```
✅ Data guru berhasil diimport!
```

**Verify in Database:**

```sql
-- Check teachers (should be 3)
SELECT * FROM profiles WHERE role_type = 'teacher' AND nip IN ('NIP101', 'NIP102', 'NIP103');

-- Check users have teacher role
SELECT u.*, r.name as role_name
FROM users u
JOIN model_has_roles mhr ON u.id = mhr.model_id
JOIN roles r ON mhr.role_id = r.id
WHERE u.email IN ('ustadz.ahmad@test.com', 'ustadzah.siti@test.com', 'ustadz.budi@test.com');
```

**Verify Login Credentials:**

```
Teacher Login:
- Email: ustadz.ahmad@test.com
- Password: teacher123
```

---

## 👪 Test 3: Upload Excel Wali

### Step 1: Download Template

1. Navigate ke **Wali** page
2. Klik button **"Upload Excel"** (icon hijau FileSpreadsheet)
3. Klik **"Download Template"**
4. File `template_wali.xlsx` akan terdownload

### Step 2: Isi Template Excel

| name         | email                 | phone        | address        |
| ------------ | --------------------- | ------------ | -------------- |
| Ahmad Rahman | ahmad.rahman@test.com | 081234567910 | Jl. Wali No. 1 |
| Siti Maryam  | siti.maryam@test.com  | 081234567911 | Jl. Wali No. 2 |
| Budi Hartono | budi.hartono@test.com | 081234567912 | Jl. Wali No. 3 |

### Step 3: Upload File

1. Klik **"Pilih File Excel"**
2. Select file yang sudah diisi
3. Klik **"Upload"**

### Step 4: Verify Results

**Expected Success Message:**

```
✅ Data wali berhasil diimport!
```

**Verify in Database:**

```sql
-- Check guardians (should be 3 new ones)
SELECT * FROM profiles p
JOIN users u ON p.user_id = u.id
WHERE u.email IN ('ahmad.rahman@test.com', 'siti.maryam@test.com', 'budi.hartono@test.com');

-- Check they have guardian/wali role
SELECT u.email, r.name as role_name
FROM users u
JOIN model_has_roles mhr ON u.id = mhr.model_id
JOIN roles r ON mhr.role_id = r.id
WHERE u.email IN ('ahmad.rahman@test.com', 'siti.maryam@test.com', 'budi.hartono@test.com');
```

**Verify Login Credentials:**

```
Guardian Login:
- Email: ahmad.rahman@test.com
- Password: Password!123
```

---

## ❌ Test 4: Error Handling

### Test Invalid Email Format

**Excel Data:**

```
nama_santri: Test Student
email_santri: invalid-email  ← INVALID
```

**Expected Error:**

```
❌ Beberapa data gagal diimport. Silakan periksa kembali file Excel Anda.

Baris 2: email_santri - Format email tidak valid
```

### Test Duplicate Email

**Excel Data:**

```
Row 1: email_wali: duplicate@test.com
Row 2: email_wali: duplicate@test.com  ← DUPLICATE
```

**Expected Error:**

```
❌ Beberapa data gagal diimport.

Baris 3: email_wali - Email sudah terdaftar
```

### Test Missing Required Fields

**Excel Data:**

```
nama_santri: (empty)  ← REQUIRED
nama_wali: (empty)    ← REQUIRED
```

**Expected Error:**

```
❌ Beberapa data gagal diimport.

Baris 2: nama_santri - Nama santri harus diisi
Baris 2: nama_wali - Nama wali harus diisi
```

### Test File Too Large

**Upload:** File > 5MB

**Expected Error:**

```
❌ The file field must not be greater than 5120 kilobytes.
```

### Test Invalid File Format

**Upload:** .txt or .doc file

**Expected Error:**

```
❌ The file field must be a file of type: xlsx, xls, csv.
```

---

## ✅ Test 5: Data Integrity

### Test Guardian Reuse

**Scenario:** Upload 2 santri dengan wali yang sama (by email)

**Excel:**

```
Row 1: Ahmad → wali: parent@test.com
Row 2: Fatimah → wali: parent@test.com (same email)
```

**Expected:**

- 2 students created
- 1 guardian created
- 2 relations in guardian_student table
- Guardian `parent@test.com` has 2 students

**SQL Verification:**

```sql
SELECT g.name as guardian_name,
       COUNT(gs.student_id) as student_count,
       GROUP_CONCAT(s.name) as students
FROM profiles g
JOIN guardian_student gs ON g.id = gs.guardian_id
JOIN profiles s ON gs.student_id = s.id
WHERE g.user_id IN (SELECT id FROM users WHERE email = 'parent@test.com')
GROUP BY g.id;

-- Expected result: 1 row with student_count = 2
```

### Test Transaction Rollback

**Scenario:** Upload file dengan 1 row valid, 1 row invalid

**Excel:**

```
Row 1: Valid data
Row 2: Invalid email format
```

**Expected:**

- Row 1: Imported successfully
- Row 2: Failed with error message
- No partial data corruption
- Error details shown per row

---

## 🔍 Test 6: UI/UX Testing

### Test Modal Behavior

1. **Open Modal** → Should show properly
2. **Download Template** → Should download Excel file
3. **Select File** → Should show file name
4. **Upload** → Should show loading state
5. **Success** → Modal should close, show toast
6. **Error** → Modal stays open, show error details
7. **Cancel** → Modal closes without upload

### Test Button States

- **Before file selected:** Upload button disabled
- **After file selected:** Upload button enabled
- **During upload:** Button shows "Mengupload..."
- **After upload:** Button returns to normal

### Test Error Display

- **Single error:** Show error message clearly
- **Multiple errors:** Show first 5, then "... dan X error lainnya"
- **Row numbers:** Should be accurate (Excel row numbers)

---

## 📝 Test Checklist

### Santri + Wali Upload

- [ ] Template download works
- [ ] Valid data imports successfully
- [ ] Duplicate guardian detection works
- [ ] Email santri optional (can be empty)
- [ ] NIS auto-generates if empty
- [ ] Validation errors show correctly
- [ ] Success message appears
- [ ] Data visible in table
- [ ] Login credentials work

### Guru Upload

- [ ] Template download works
- [ ] Valid data imports successfully
- [ ] NIP required and unique
- [ ] Email required and unique
- [ ] Teacher role assigned
- [ ] Success message appears
- [ ] Data visible in table
- [ ] Login credentials work

### Wali Upload

- [ ] Template download works
- [ ] Valid data imports successfully
- [ ] Email required and unique
- [ ] Guardian role assigned
- [ ] Success message appears
- [ ] Data visible in table
- [ ] Login credentials work

### Error Handling

- [ ] Invalid email format detected
- [ ] Duplicate email detected
- [ ] Missing required fields detected
- [ ] File size limit enforced
- [ ] File type validation works
- [ ] Row-level errors shown clearly

---

## 🐛 Known Issues & Limitations

### Current Limitations:

1. **Max file size:** 5MB per upload
2. **No batch edit:** Can't update existing users via Excel
3. **Password reset:** All new users get default passwords
4. **No photo upload:** Profile photos not supported in Excel

### Future Improvements:

- [ ] Support for updating existing users
- [ ] Custom password setting in Excel
- [ ] Photo URL import
- [ ] Bulk delete via Excel
- [ ] Import history/audit log

---

## 📊 Performance Testing

### Test Large File Import

**Scenario:** Upload 100+ rows

**Steps:**

1. Create Excel with 100 students + guardians
2. Upload file
3. Monitor:
    - Upload time
    - Server response time
    - Database load
    - Memory usage

**Expected:**

- Upload completes in < 30 seconds
- No timeout errors
- All data imported correctly
- No memory leaks

### Test Concurrent Uploads

**Scenario:** Multiple admins upload simultaneously

**Steps:**

1. Open 3 browser tabs (3 admin users)
2. Upload different Excel files at same time
3. Verify all uploads complete successfully

**Expected:**

- No data corruption
- No duplicate data
- All uploads tracked separately
- Correct flash messages per tab

---

## 🔐 Security Testing

### Test File Content

**Malicious File:** Excel with formulas/macros

**Expected:** File processed safely, formulas ignored

### Test SQL Injection

**Excel Data:** `'; DROP TABLE users; --`

**Expected:** Data escaped, no SQL execution

### Test XSS

**Excel Data:** `<script>alert('XSS')</script>`

**Expected:** Data escaped, no script execution

---

## 📞 Troubleshooting

### Issue: "File tidak ditemukan"

**Solution:** Check file upload max size in php.ini

### Issue: "Timeout saat upload"

**Solution:** Increase `max_execution_time` in php.ini

### Issue: "Data tidak muncul setelah import"

**Solution:**

1. Check database transactions
2. Verify role assignments
3. Check validation errors in log

### Issue: "Template tidak bisa didownload"

**Solution:**

1. Check routes registered
2. Verify controller method
3. Check file permissions

---

**Last Updated:** 7 November 2025  
**Version:** 1.0  
**Status:** Ready for Testing ✅
