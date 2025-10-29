# 📚 Hafalan App - Dokumentasi Lengkap

## 📑 Daftar Isi

1. [Overview](#overview)
2. [Instalasi & Setup](./INSTALLATION.md)
3. [Arsitektur Sistem](./ARCHITECTURE.md)
4. [Roles & Permissions](./ROLES_PERMISSIONS.md)
5. [API Documentation](./API.md)
6. [Services Documentation](./SERVICES.md)
7. [Database Schema](./DATABASE.md)
8. [Frontend Components](./FRONTEND.md)
9. [Import/Export Features](./IMPORT_EXPORT.md)
10. [Deployment Guide](./DEPLOYMENT.md)
11. [Troubleshooting](./TROUBLESHOOTING.md)

---

## Overview

**Hafalan App** adalah aplikasi manajemen hafalan Al-Qur'an untuk pesantren/lembaga pendidikan Islam yang memungkinkan:

- **Guru/Ustadz** mencatat setoran hafalan santri
- **Santri** memantau progres hafalan mereka
- **Wali Santri** melihat perkembangan hafalan anak
- **Admin** mengelola data pengguna dan menganalisis performa

### 🎯 Fitur Utama

#### 1. **Manajemen User**
- Multi-role system (Admin, Teacher, Guardian, Student)
- Import CSV untuk bulk user creation
- Force password change untuk keamanan

#### 2. **Pencatatan Hafalan**
- Setoran per-ayat dengan status `murojaah` atau `selesai`
- Validasi sekuensial hafalan
- Audit log untuk setiap aktivitas
- Filter dan search advanced

#### 3. **Analytics & Reporting**
- Dashboard real-time dengan charts
- Analitik per kelas, santri, dan guru
- Export rapor PDF untuk wali santri

#### 4. **Security Features**
- CSRF Protection
- Rate limiting
- Authorization dengan Gates & Policies
- Audit logging
- Two-Factor Authentication (2FA)

---

## 🛠️ Tech Stack

### Backend
- **Laravel 11.x** - PHP Framework
- **MySQL/PostgreSQL** - Database
- **Spatie Laravel Permission** - Role & Permission Management
- **Laravel Fortify** - Authentication
- **Maatwebsite Excel** - Import/Export CSV

### Frontend
- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Inertia.js** - SPA-like Experience
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Recharts** - Data Visualization
- **React Toastify** - Notifications

---

## 📦 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd hafalan-app

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate --seed

# Build frontend
npm run build

# Start development server
php artisan serve
npm run dev
```

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `Password!123`

⚠️ **Segera ganti password setelah login pertama!**

---

## 🗂️ Struktur Proyek

```
hafalan-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # HTTP Controllers
│   │   ├── Middleware/        # Custom Middleware
│   │   └── Requests/          # Form Request Validation
│   ├── Models/                # Eloquent Models
│   ├── Policies/              # Authorization Policies
│   ├── Support/               # Helper Classes (Services)
│   └── Imports/               # CSV Import Classes
├── database/
│   ├── migrations/            # Database Migrations
│   └── seeders/               # Database Seeders
├── resources/
│   ├── js/
│   │   ├── components/        # React Components
│   │   ├── pages/             # Page Components
│   │   ├── layouts/           # Layout Components
│   │   └── types/             # TypeScript Types
│   └── views/                 # Blade Templates
├── routes/
│   ├── web.php                # Web Routes
│   ├── auth.php               # Auth Routes
│   └── settings.php           # Settings Routes
└── docs/                      # Documentation
```

---

## 📖 Dokumentasi Detail

### [📥 Instalasi & Setup](./INSTALLATION.md)
Panduan lengkap instalasi dari development hingga production.

### [🏗️ Arsitektur Sistem](./ARCHITECTURE.md)
Penjelasan struktur aplikasi, design patterns, dan best practices.

### [👥 Roles & Permissions](./ROLES_PERMISSIONS.md)
Detail sistem authorization dan hak akses setiap role.

### [🔌 API Documentation](./API.md)
Dokumentasi lengkap semua API endpoints dengan contoh request/response.

### [⚙️ Services Documentation](./SERVICES.md)
Penjelasan business logic services (ScopeService, AuditLogger, dll).

### [💾 Database Schema](./DATABASE.md)
ER Diagram dan penjelasan struktur database.

### [🎨 Frontend Components](./FRONTEND.md)
Dokumentasi React components dan state management.

### [📤 Import/Export Features](./IMPORT_EXPORT.md)
Cara menggunakan fitur import CSV dan export data.

### [🚀 Deployment Guide](./DEPLOYMENT.md)
Panduan deployment ke production server.

### [🔧 Troubleshooting](./TROUBLESHOOTING.md)
Solusi untuk masalah umum yang sering terjadi.

---

## 🤝 Kontribusi

Untuk berkontribusi pada proyek ini:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📝 License

Proyek ini menggunakan MIT License.

---

## 📞 Support

Untuk bantuan atau pertanyaan:
- Email: support@hafalan-app.com
- Documentation: https://docs.hafalan-app.com
- Issue Tracker: GitHub Issues

---

## 🔄 Changelog

### Version 1.0.0 (2025-10-26)
- Initial release
- Multi-role user management
- Hafalan tracking system
- Analytics dashboard
- PDF report generation
- CSV import/export
- 2FA authentication
