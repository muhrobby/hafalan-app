# 📋 PROMPT MIGRASI FULL STACK LARAVEL+REACT KE NUXT 3 - SISTEM HAFALAN & RAPORT

## 📌 KONTEKS APLIKASI

Aplikasi adalah sistem manajemen hafalan (Al-Quran) dan raport untuk institusi pendidikan. Memiliki multiple roles: Admin, Guru/Teacher, Santri/Student, Wali/Guardian dengan permission-based access control.

---

## 🔧 DATABASE SCHEMA & MODEL RELATIONSHIPS

### Models & Relationships:

**User** (Authentication)
- Memiliki role(s): admin, teacher, student, wali/guardian
- Memiliki 1 Profile
- Has 2FA settings

**Profile** (Unified Profile untuk semua user types)
- Fields: id, user_id, nis (NIS untuk student), nip (NIP untuk teacher), phone, birth_date, address, class_id, entry_year
- Scopes:
  - `students()` → whereNotNull('nis')
  - `teachers()` → whereNotNull('nip')
  - `guardians()` → hasRole('wali')
- Methods:
  - `isStudent()` → check user role
  - `isTeacher()` → check user role
  - `isGuardian()` → check user role
  - `generateNis(?date)` → generate NIS format YYMMDDxxxxxx (auto-increment per day)
  - `generateNip(?date)` → generate NIP format YYYYMMDDxxxx (auto-increment per day)
- Relationships:
  - belongsTo User
  - belongsTo Classe (for students)
  - hasMany Hafalan (as student)
  - belongsToMany Profile via profile_relations where relation_type='guardian' (guardians for student)
  - belongsToMany Profile via profile_relations where relation_type='guardian' (students for guardian)
  - belongsToMany Classe via class_teacher (teachers for classes)

**Hafalan** (Setoran hafalan/Quran memorization record)
- Fields: id, student_id (FK Profile), teacher_id (FK Profile), surah_id (FK Surah), from_ayah, to_ayah, date, status (murojaah/selesai), score, notes, timestamps
- Status Options: 'murojaah' (repeat/review), 'selesai' (completed)
- Scopes:
  - `betweenDates(?from, ?to)` → filter by date range
- Relationships:
  - belongsTo Profile (student)
  - belongsTo Profile (teacher)
  - belongsTo Surah

**Surah**
- Fields: id, code (Az-Zalzalah, dll), name, ayah_count
- Relationships: hasMany Hafalan

**Classe** (Kelas)
- Fields: id, name
- Relationships:
  - hasMany Profile (students)
  - belongsToMany Profile via class_teacher (teachers)

**ProfileRelation** (Many-to-many relationship untuk guardian-student)
- Fields: id, profile_id, related_profile_id, relation_type (guardian), timestamps

**AuditLog** (Logging semua aktivitas)
- Fields: id, user_id, action, description, metadata (JSON), timestamps

---

## 🛡️ AUTHORIZATION & SCOPE SERVICE LOGIC

### ScopeService (Critical Business Logic)

```
accessibleProfileIds(User $user) → Collection|null
- Admin → null (akses semua)
- Teacher → student IDs dari classes yang diajar
- Guardian → student IDs melalui profile_relations
- Student → hanya profile_id milik sendiri
- Else → empty collection

profilesForUser(User) → Collection
- Query Profile dengan whereNotNull('nis')
- Apply scope jika bukan admin
- Return profiles yang accessible oleh user

applyHafalanScope(Query, User) → Query
- Filter hafalan berdasarkan accessible student IDs
- Admin → tanpa filter
- Else → whereIn('student_id', accessibleProfileIds)

applyProfileScope(Query, User) → Query
- Similar dengan applyHafalanScope

canAccessProfile(User, Profile) → bool
- Check apakah user bisa akses profile tertentu
- Admin → true
- Else → cek di accessible profile IDs

studentOptions(User) → Collection
- Get list students yang accessible
- Return: [{id, name}]

teacherOptions() → Collection
- Get semua teachers
- Return: [{id, name}]

classOptionsFor(User) → Collection
- Filter classes berdasarkan role:
  - Teacher: classes yang diajar
  - Student: class milik student
  - Guardian: classes dari students yang jadi tanggung jawab
  - Admin: semua classes
- Return: [{id, name}]
```

### Permissions/Gates:
- `view-hafalan` → Can view hafalan list
- `input-hafalan` → Can input/create new hafalan
- `view-analytics` → Can view analytics
- `view-student-report` → Can view student report

---

## 📊 KEY BUSINESS LOGIC & CONTROLLERS

### 1. HafalanController

**index(Request)**
- Gate: view-hafalan
- Apply ScopeService.applyHafalanScope()
- Filters: student_id, surah_id, from_date, to_date
- Load relations: student.user, teacher.user, surah
- Authorization check: canAccessProfile() untuk student_id filter
- Response: {hafalans, filters, students, surahs}
- Hafalans format: {id, date, student_id, surah_id, surah{name,code}, from_ayah, teacher, student, notes, status}

**create(Request)**
- Gate: input-hafalan
- Get accessible students via profilesForUser()
- Get all surahs with: id, code, name, ayah_count
- Get repeat notices (latest hafalan dengan status='murojaah' grouped by student)
  - Format repeat: {id, label: "Surah - Name ayat X (dd M Y)"}
- Response: {students, surahs, defaultDate, repeats}

**store(StoreHafalanRequest)**
- Gate: input-hafalan
- Validate: student_id, teacher_id, surah_id, from_ayah, to_ayah, date, status, score (optional), notes (optional)
- teacher_id dari Auth::user()->profile?->id
- Create Hafalan record
- Log audit: 'hafalan.store' dengan metadata
- Redirect with success flash

### 2. ReportController

**student(Profile $student, Request)**
- Gate: view-student-report
- Check: $student->isStudent()
- Date range dari query params: from, to
- Query hafalans untuk student dengan betweenDates scope
- Calculate summary:
  - totalSetoran → count all hafalans
  - totalMurojaah → count where status='murojaah'
  - totalSelesai → count where status='selesai'
- Load: student.user, student.class.teachers.user
- Response: PDF atau HTML view dengan:
  - student data
  - hafalan list
  - summary stats
  - period dates
  - schoolHeadName dari config

### 3. AnalyticsController

**index(Request) + getData(Request)**

- Gate: view-analytics
- Determine variant: admin/teacher/student (based on role)
- Date period: dari query params atau default (30 hari terakhir)
- Apply scope: ScopeService.applyHafalanScope()
- Filters: student_id, teacher_id, class_id
- Trend analysis: groupBy day, count total, murojaah, selesai
- Aggregate: total records, murojaah count, selesai count
- Per Surah distribution: top 10 surahs dengan count murojaah & selesai
- Status distribution: pie chart murojaah vs selesai
- Class Performance (hanya admin): groupBy class, count per status
- Roles Distribution (hanya admin): count users per role
- Response: {variant, summary, trend, roles, classPerformance, perSurah, statusDistribution, filters, availableFilters}

---

## 🔐 AUTHENTICATION FEATURES

### User Authentication:
- Email/password login (laravel fortify)
- User registration
- Password reset via email
- Two-factor authentication (TOTP/OTP)
- Session management

### Two-Factor Auth:
- Enable/disable 2FA
- Generate backup codes
- QR code generation

---

## 📋 ADDITIONAL FEATURES

### Audit Logging:
```
AuditLogger::log(action: 'hafalan.store', description, metadata)
- Records user_id, action, description, metadata (JSON)
- Stores in audit_logs table
```

### Import/Export:
- StudentsExport, TeachersExport, GuardiansExport, AdminsExport (Excel)
- StudentImport, TeacherImport, GuardianImport, AdminImport

### User Management:
- Admin user management (CRUD)
- Teacher management
- Student management (with NIS generation)
- Guardian/Wali management
- Profile management
- Password management

---

## 🎯 REQUIREMENTS UNTUK NUXT IMPLEMENTATION

### Tech Stack:
✓ Nuxt 3.15+
✓ TypeScript (strict mode)
✓ Vue 3 Composition API
✓ Tailwind CSS v4
✓ shadcn/nuxt (UI components)
✓ Pinia (state management)
✓ Zod (validation)
✓ Drizzle ORM atau Prisma (database layer)
✓ Nitro (API server)
✓ SQLite (database)

### Backend API Endpoints (Nitro):

**Auth:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh-token
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/2fa/setup
- POST /api/auth/2fa/verify
- POST /api/auth/2fa/disable

**Hafalans:**
- GET /api/hafalans (with filters: student_id, surah_id, from_date, to_date)
- POST /api/hafalans (create)
- GET /api/hafalans/:id
- PATCH /api/hafalans/:id (update)
- DELETE /api/hafalans/:id
- GET /api/hafalans/repeat-notices (get murojaah records untuk repeat)

**Reports:**
- GET /api/reports/student/:studentId (dengan query params: from, to)
- GET /api/reports/student/:studentId/pdf (generate PDF)

**Analytics:**
- GET /api/analytics (dengan filters)
- GET /api/analytics/data (more detailed data untuk charts)

**Students:**
- GET /api/students (with pagination)
- POST /api/students
- GET /api/students/:id
- PATCH /api/students/:id
- DELETE /api/students/:id
- GET /api/students/generate-nis

**Teachers:**
- GET /api/teachers
- POST /api/teachers
- GET /api/teachers/:id
- PATCH /api/teachers/:id
- DELETE /api/teachers/:id
- GET /api/teachers/generate-nip

**Classes:**
- GET /api/classes
- POST /api/classes
- GET /api/classes/:id
- PATCH /api/classes/:id
- DELETE /api/classes/:id
- POST /api/classes/:classId/assign-students
- POST /api/classes/:classId/assign-teachers

**Guardians:**
- GET /api/guardians
- POST /api/guardians
- GET /api/guardians/:id
- PATCH /api/guardians/:id
- DELETE /api/guardians/:id
- POST /api/guardians/:guardianId/assign-students

**Surahs:**
- GET /api/surahs (read-only reference data)

**Admin/User Management:**
- GET /api/admin/users
- POST /api/admin/users
- GET /api/admin/users/:id
- PATCH /api/admin/users/:id
- DELETE /api/admin/users/:id
- POST /api/admin/users/:userId/assign-role

**Audit Logs:**
- GET /api/audit-logs (hanya admin)

---

## 📄 FRONTEND PAGES (Vue 3 Components)

### Layout Pages:
- `/layouts/authenticated.vue` (with navbar, sidebar)
- `/layouts/auth.vue` (simple layout untuk auth pages)

### Pages Structure:
```
/pages/
├── auth/
│   ├── login.vue
│   ├── register.vue
│   ├── forgot-password.vue
│   ├── reset-password/[token].vue
│   └── verify-2fa.vue
├── dashboard/
│   └── index.vue (variant: admin/teacher/student/guardian)
├── hafalans/
│   ├── index.vue (list dengan filters)
│   └── create.vue (form input hafalan)
├── reports/
│   ├── students.vue (list students)
│   └── [studentId].vue (view/download report)
├── analytics/
│   └── index.vue (charts & statistics)
├── admin/
│   ├── users/
│   │   ├── index.vue
│   │   ├── create.vue
│   │   └── [id]/edit.vue
│   ├── students/
│   │   ├── index.vue
│   │   ├── create.vue
│   │   └── [id]/edit.vue
│   ├── teachers/
│   │   ├── index.vue
│   │   ├── create.vue
│   │   └── [id]/edit.vue
│   ├── classes/
│   │   ├── index.vue
│   │   └── [id]/manage.vue
│   ├── guardians/
│   │   ├── index.vue
│   │   ├── create.vue
│   │   └── [id]/edit.vue
│   ├── import-export.vue
│   └── audit-logs.vue
├── profile/
│   ├── settings.vue
│   ├── password.vue
│   └── 2fa.vue
└── [404].vue
```

### Key Components:
- HafalanForm (create/edit hafalan)
- ReportViewer (display hafalan entries with stats)
- AnalyticsCharts (trend chart, status distribution, class performance)
- DataTable (generic table with sorting, filtering, pagination)
- FilterBar (date range, student selector, etc)
- UserForm (CRUD user dialogs)
- RoleSelector (multi-role select)
- ProfileCard (display profile info)

---

## 🔄 IMPORTANT LOGIC TO MIGRATE

### 1. NIS/NIP Generation
```
Pattern: YYMMDDxxxxxx (untuk NIS, 6 digit auto-increment per hari)
Pattern: YYYYMMDDxxxx (untuk NIP, 4 digit auto-increment per hari)
- Query latest dengan prefix
- Increment sequence
- Pad dengan leading zeros
```

### 2. Date Range Filtering
```
- Query betweenDates(from, to)
- Scope untuk filter: whereDate('date', '>=', from) dan whereDate('date', '<=', to)
```

### 3. Access Control & Scoping
```
- Dependency injection ScopeService di store/composables
- Apply scope untuk setiap query berdasarkan user role
- Authorization middleware untuk endpoints
```

### 4. Hafalan Status Workflow
```
- Status: 'murojaah' (repeat/review) atau 'selesai' (completed)
- Score field (untuk penilaian)
- Repeat notices logic: get latest hafalan per (student, surah, from_ayah) dengan status=murojaah
```

### 5. Report Generation
```
- PDF generation untuk student report (bisa gunakan: pdfkit, wkhtmltopdf, atau html2pdf)
- Include: student info, hafalan entries, summary stats, period, school head name
```

### 6. Analytics Aggregation
```
- Trend: group by date, count total/murojaah/selesai
- Per surah distribution: top 10
- Class performance: group by class
- Status distribution: pie chart
- Role distribution (admin only)
```

### 7. Audit Logging
```
- Log setiap action penting: hafalan.store, user.create, etc
- Store: user_id, action, description, metadata (JSON)
```

---

## 🚀 MIGRATION STRATEGY

1. **Setup Nuxt Project**
   - Nuxt 3 dengan Nitro server
   - TypeScript configuration
   - Tailwind CSS v4
   - shadcn/nuxt setup
   - Pinia store structure

2. **Database & ORM**
   - Setup SQLite dengan Drizzle/Prisma
   - Migrate schema dari Laravel migrations
   - Setup relations dan constraints

3. **Authentication System**
   - JWT atau session-based auth
   - Login, register, password reset
   - 2FA dengan TOTP
   - Middleware untuk protected routes

4. **Core API Endpoints**
   - Start dengan auth endpoints
   - Hafalan CRUD operations
   - Reports endpoints
   - Analytics endpoints

5. **Authorization & Middleware**
   - Role-based middleware
   - ScopeService equivalence di Nitro
   - Permission gates di endpoints

6. **Frontend Pages & Components**
   - Layout setup
   - Auth pages
   - Dashboard variants
   - Hafalan management
   - Reports & Analytics

7. **State Management (Pinia)**
   - Auth store (user, token, permissions)
   - Hafalan store (list, filters, caching)
   - UI store (modals, toasts, sidebar)

8. **Validation & Error Handling**
   - Zod schemas untuk input validation
   - Error responses dengan proper HTTP status
   - Toast notifications untuk user feedback

9. **Features**
   - PDF report generation
   - Import/Export data
   - Audit logging
   - Date range filtering
   - Dynamic form generation

10. **Deployment & Testing**
    - Unit tests untuk business logic
    - Integration tests untuk API
    - Build optimization
    - Environment configuration

---

## ⚠️ CRITICAL NOTES

1. **Scoping Logic**: Setiap query hafalan HARUS apply scope berdasarkan user role
2. **Authorization**: Check permissions SEBELUM returning data
3. **NIS/NIP Generation**: Thread-safe, incremental per hari dengan prefix format
4. **Date Filtering**: Always use ISO format (YYYY-MM-DD) untuk consistency
5. **Relationships**: profile_relations banyak-ke-banyak untuk guardian-student
6. **Audit Logging**: Log critical actions dengan full metadata
7. **PDF Generation**: Persiapkan layout similar dengan Laravel report
8. **Performance**: Cache surahs list, optimize query dengan eager loading
9. **Validation**: Validate tahap request, validasi tahap input dengan Zod
10. **Error Handling**: Consistent error messages untuk frontend

---

Mulai dengan setup Nuxt 3 project, database schema, dan implementasi authentication system. 
Setelah itu, migrasi features satu-per-satu dengan fokus pada business logic accuracy dan authorization correctness.

Pastikan setiap API endpoint meng-apply scope service untuk filtering based on user role!
