# Refactoring Besar: Hafalan App - Security, Performance & User Experience

**Tanggal:** 7 November 2025

## 🎯 Daftar Refactoring

### ✅ 1. Email Santri Menjadi Opsional

**Alasan:** Santri tidak memerlukan email untuk login, hanya wali dan guru.

**Perubahan:**

- `app/Http/Requests/StoreStudentRequest.php` - Email validation dari `required` → `nullable`
- `app/Http/Requests/UpdateStudentRequest.php` - Email validation dari `required` → `nullable`
- `resources/js/pages/students/student-form-modal.tsx` - Hapus field email dari form

**Testing:**

```bash
# Test create student without email
php artisan tinker
>>> $student = App\Models\Profile::create(['name' => 'Test Student', 'nis' => 'TEST001']);
```

---

### ✅ 2. Hapus Kolom Kelas dari Semua Tabel

**Alasan:** Sistem tidak lagi menggunakan konsep kelas, teacher bisa akses semua santri.

**Migration:** `2025_11_07_121845_remove_class_columns_from_all_tables.php`

**Tabel yang Diubah:**

- ❌ `classes` table → DROPPED
- ❌ `class_teacher` table → DROPPED
- ❌ `students.class_id` column → DROPPED
- ❌ `profiles.class_id` column → DROPPED
- ❌ `profiles.class_name` column → DROPPED
- ❌ `hafalans.class_id` column → DROPPED (if exists)

**Rollback Plan:**

```bash
php artisan migrate:rollback --step=1
```

---

### ✅ 3. Fix Modal "Buat Wali Baru" Auto-Close

**Masalah:** Modal tidak auto-close setelah berhasil create wali.

**Solusi:** Render `QuickGuardianModal` di luar parent `Dialog` dengan conditional rendering.

**File:** `resources/js/pages/students/student-form-modal.tsx`

```tsx
// Render outside parent Dialog to prevent nesting issues
{
    open && (
        <QuickGuardianModal
            open={quickGuardianOpen}
            onOpenChange={setQuickGuardianOpen}
            onSuccess={(guardianId, guardianName) => {
                // Add to options + auto-select
            }}
        />
    );
}
```

---

## 🚀 TODO: Upload Excel dengan Laravel Excel

### 📊 4.1 Upload Combo Santri + Wali (Excel)

**Template Excel:**
| nama_santri | tanggal_lahir | telepon_santri | nama_wali | email_wali | telepon_wali | alamat_wali |
|-------------|---------------|----------------|-----------|------------|--------------|-------------|
| Ahmad | 2010-01-15 | 081234567890 | Budi | budi@... | 081234... | Jl. ... |

**Implementation Steps:**

1. Install Laravel Excel: `composer require maatwebsite/excel`
2. Create Import class: `php artisan make:import StudentGuardianImport --model=Profile`
3. Create template generator
4. Update controller & routes
5. Add frontend upload UI

---

### 📊 4.2 Upload Guru (Excel)

**Template Excel:**
| nama | email | nip | telepon | alamat |
|------|-------|-----|---------|--------|
| Pak Ahmad | ahmad@... | NIP001 | 081... | Jl. ... |

---

### 📊 4.3 Upload Wali (Excel)

**Template Excel:**
| nama | email | telepon | alamat |
|------|-------|---------|--------|
| Ibu Siti | siti@... | 081... | Jl. ... |

---

## 🔒 5. Security Hardening

### 5.1 Authentication & Authorization

- ✅ Spatie Permission implemented
- ⏳ Add rate limiting on login
- ⏳ Implement CSRF protection verification
- ⏳ Add 2FA enforcement for admin
- ⏳ Session security hardening

### 5.2 Input Validation

- ✅ Form Request validation
- ⏳ SQL Injection prevention check
- ⏳ XSS prevention check
- ⏳ CORS policy review

### 5.3 Data Protection

- ⏳ Encrypt sensitive data (phone numbers, addresses)
- ⏳ Add audit logging for admin actions
- ⏳ Implement data retention policy

---

## 📈 6. Load Testing & Performance

### 6.1 Load Testing Plan

**Tool:** Apache JMeter / k6

**Scenarios:**

1. **Login Storm:** 100 concurrent users login dalam 10 detik
2. **Data Entry:** 50 users input hafalan simultaneously
3. **Report Generation:** 20 users generate reports at same time
4. **Dashboard Load:** 100 users open dashboard simultaneously

**Metrics:**

- Response time (target: < 200ms for API, < 1s for pages)
- Error rate (target: < 0.1%)
- Throughput (requests/second)
- Resource usage (CPU, Memory, Database connections)

### 6.2 Performance Optimization

- ⏳ Add Redis caching for frequent queries
- ⏳ Database query optimization (indexes)
- ⏳ Lazy loading for large datasets
- ⏳ API response compression
- ⏳ Frontend bundle optimization

---

## 🛡️ 7. Penetration Testing

### 7.1 OWASP Top 10 Check

1. **Broken Access Control** - Check role-based access
2. **Cryptographic Failures** - Verify password hashing
3. **Injection** - Test SQL, XSS, Command injection
4. **Insecure Design** - Review authentication flow
5. **Security Misconfiguration** - Check exposed endpoints
6. **Vulnerable Components** - Audit dependencies
7. **Authentication Failures** - Test password policies
8. **Data Integrity Failures** - Verify CSRF tokens
9. **Security Logging Failures** - Check audit trails
10. **SSRF** - Test external URL inputs

### 7.2 Tools

- **OWASP ZAP** - Automated vulnerability scanner
- **Burp Suite** - Manual penetration testing
- **SQLMap** - SQL injection testing
- **Nikto** - Web server scanner

---

## 📝 Testing Checklist

### Functional Testing

- [ ] Santri creation without email
- [ ] Guardian modal auto-close works
- [ ] Upload Excel santri + wali
- [ ] Upload Excel guru
- [ ] Upload Excel wali
- [ ] All pages work without class columns
- [ ] Teacher can access all students

### Security Testing

- [ ] Login rate limiting works
- [ ] CSRF tokens validated
- [ ] XSS prevention tested
- [ ] SQL injection blocked
- [ ] Role-based access enforced

### Performance Testing

- [ ] Load test: 100 concurrent users
- [ ] Database queries optimized
- [ ] API response time < 200ms
- [ ] Frontend load time < 2s
- [ ] No memory leaks

---

## 🚦 Status Tracking

| Task                        | Status         | Priority | Notes                |
| --------------------------- | -------------- | -------- | -------------------- |
| Email optional for students | ✅ DONE        | HIGH     | Validated            |
| Remove class columns        | ✅ DONE        | HIGH     | Migration successful |
| Fix guardian modal          | ✅ DONE        | HIGH     | Tested               |
| Excel upload santri+wali    | 🔄 IN PROGRESS | HIGH     | Template created     |
| Excel upload guru           | ⏳ TODO        | MEDIUM   | -                    |
| Excel upload wali           | ⏳ TODO        | MEDIUM   | -                    |
| Security hardening          | ⏳ TODO        | HIGH     | Plan ready           |
| Load testing                | ⏳ TODO        | HIGH     | JMeter setup         |
| Penetration testing         | ⏳ TODO        | HIGH     | OWASP ZAP            |

---

## 📚 Next Steps

1. **Immediate (Today)**
    - Implement Excel upload for santri+wali
    - Create Excel templates
    - Add security rate limiting

2. **Short Term (This Week)**
    - Complete all Excel uploads
    - Run load testing
    - Basic security audit

3. **Medium Term (Next Week)**
    - Full penetration testing
    - Performance optimization
    - Documentation completion

---

## 🔗 References

- Laravel Excel: https://docs.laravel-excel.com
- OWASP Top 10: https://owasp.org/www-project-top-ten
- Laravel Security: https://laravel.com/docs/security
- JMeter: https://jmeter.apache.org
