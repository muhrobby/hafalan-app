# Hafalan App

> Aplikasi manajemen hafalan Al-Quran untuk pondok pesantren dan lembaga pendidikan Islam

## 🚀 Migration to Nuxt 3 (IN PROGRESS)

**⚠️ IMPORTANT:** This repository is currently undergoing a major migration from Laravel + Inertia.js + React to Full-Stack Nuxt 3.

### Current Status: Phase 1-3 Complete (23%)

The new Nuxt 3 application is located in the `hafalan-nuxt/` directory. See the migration documentation for details:
- 📖 [Phase 1-3 Completion Summary](docs/PHASE_1-3_COMPLETION_SUMMARY.md)
- 📊 [Migration Progress Tracking](docs/NUXT_MIGRATION_PROGRESS.md)
- 📋 [Complete Migration Plan](docs/FULLSTACK_NUXT_MIGRATION_GUIDE.md)

### Quick Links

#### Nuxt 3 (NEW - In Development)
- Location: `/hafalan-nuxt/`
- Setup Guide: [hafalan-nuxt/README.md](hafalan-nuxt/README.md)
- Status: ✅ Foundation Complete (Auth, Database, Basic Pages)

#### Laravel (CURRENT - Stable)
- Location: `/` (root directory)
- Status: ✅ Production Ready
- Stack: Laravel 12 + Inertia.js + React 19

---

## Laravel + React Application (Current)

### Introduction

The current production application uses Laravel + Inertia.js + React stack:
- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 with TypeScript
- **UI**: Tailwind CSS + shadcn/ui + radix-ui
- **Database**: MySQL/PostgreSQL
- **Auth**: Laravel Fortify + Spatie Permissions

### Features (Laravel Version)
- ✅ User authentication with 2FA support
- ✅ Role-based access control (admin, teacher, guardian, student)
- ✅ Student management with NIS auto-generation
- ✅ Teacher management with NIP auto-generation
- ✅ Guardian management with student relationships
- ✅ Class management
- ✅ Hafalan (Quran memorization) tracking
- ✅ Analytics and reports
- ✅ CSV/Excel import and export
- ✅ PDF report generation
- ✅ Audit logging

### Laravel Setup

```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Build frontend assets
npm run build

# Start development server
composer run dev
```

Visit: http://localhost:8000

---

## Nuxt 3 Application (New)

### Introduction

The new full-stack application uses Nuxt 3:
- **Framework**: Nuxt 3 (Vue 3) with TypeScript
- **ORM**: Prisma
- **Database**: SQLite (dev) / MySQL/PostgreSQL (prod)
- **Auth**: Custom JWT + bcrypt
- **UI**: Nuxt UI + Tailwind CSS

### Features (Nuxt Version - Completed)
- ✅ Authentication system (JWT + RBAC)
- ✅ Login/logout functionality
- ✅ Database schema (Prisma)
- ✅ Role and permission system
- ✅ Basic dashboard
- ⏳ Student management (upcoming)
- ⏳ Teacher management (upcoming)
- ⏳ Hafalan tracking (upcoming)
- ⏳ Analytics and reports (upcoming)

### Nuxt Setup

```bash
# Navigate to Nuxt directory
cd hafalan-nuxt

# Install dependencies
npm install

# Setup database
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run dev
```

Visit: http://localhost:3000

**Default Login:**
- Email: `admin@hafalan.app`
- Password: `admin123`

---

## Documentation

### Migration Documentation
- [Phase 1-3 Completion Summary](docs/PHASE_1-3_COMPLETION_SUMMARY.md) - What's been completed
- [Migration Progress](docs/NUXT_MIGRATION_PROGRESS.md) - Detailed progress tracking
- [Migration Plan](docs/FULLSTACK_NUXT_MIGRATION_GUIDE.md) - Complete migration roadmap

### Laravel Documentation
- [Installation Guide](docs/INSTALLATION.md)
- [CSV Import Guide](docs/CSV_IMPORT_ENHANCED.md)
- Various feature documentation in `/docs/`

### Nuxt Documentation
- [Nuxt Setup Guide](hafalan-nuxt/README.md)

---

## Migration Timeline

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1-3 | ✅ Complete | Foundation (Setup, Database, Auth) |
| Phase 4 | 🔄 Next | Layouts & UI Components |
| Phase 5 | ⏳ Pending | Dashboard |
| Phase 6-8 | ⏳ Pending | CRUD Modules |
| Phase 9 | ⏳ Pending | Hafalan Module |
| Phase 10-11 | ⏳ Pending | Analytics & Additional Features |
| Phase 12 | ⏳ Pending | Data Migration |
| Phase 13 | ⏳ Pending | Testing & Deployment |

**Overall Progress: 23% Complete**

---

## Contributing

Thank you for considering contributing to this project! Please review the Laravel [contribution guidelines](https://laravel.com/docs/contributions).

## Code of Conduct

Please review and abide by the [Laravel Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## License

This project is open-sourced software licensed under the MIT license.

