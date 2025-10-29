# Hafalan App - Nuxt 3 Full-Stack

This is the new Full-Stack Nuxt 3 implementation of the Hafalan App, migrated from Laravel + Inertia.js + React.

## Tech Stack

- **Framework**: Nuxt 3 (Vue 3)
- **ORM**: Prisma
- **Database**: MySQL/PostgreSQL
- **Authentication**: JWT with bcrypt
- **UI**: Nuxt UI, Tailwind CSS
- **State Management**: Pinia
- **Forms**: VeeValidate + Zod
- **Charts**: Vue Chart.js
- **Utilities**: VueUse, date-fns

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your database connection string:

```env
DATABASE_URL="mysql://user:password@localhost:3306/hafalan_app"
JWT_SECRET="your-very-secret-jwt-key-change-in-production"
```

### 3. Database Setup

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

Seed the database with initial data (roles, permissions, surahs, admin user):

```bash
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Default Login Credentials

After seeding, you can login with:

- **Email**: `admin@hafalan.app`
- **Password**: `admin123`

**Important**: Change the password after first login!

## Project Structure

```
hafalan-nuxt/
├── prisma/              # Prisma schema and migrations
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeder
├── server/              # Server-side code (Nitro)
│   ├── api/             # API endpoints
│   │   └── auth/        # Authentication endpoints
│   ├── middleware/      # Server middleware
│   └── utils/           # Server utilities (auth helpers)
├── components/          # Vue components
├── composables/         # Vue composables
├── layouts/             # Nuxt layouts
├── pages/               # File-based routing
│   ├── index.vue        # Home page (redirects)
│   ├── login.vue        # Login page
│   └── dashboard.vue    # Dashboard
├── stores/              # Pinia stores
│   └── auth.ts          # Auth store
├── types/               # TypeScript type definitions
├── utils/               # Client-side utilities
└── nuxt.config.ts       # Nuxt configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with initial data
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Features

### Completed ✅

- [x] Project setup and configuration
- [x] Prisma schema matching Laravel database
- [x] Authentication system (JWT + bcrypt)
- [x] Login/Logout functionality
- [x] Auth store with Pinia
- [x] Basic dashboard
- [x] Database seeding (roles, permissions, surahs)

### In Progress 🚧

- [ ] User management
- [ ] Students CRUD
- [ ] Teachers CRUD
- [ ] Guardians CRUD
- [ ] Classes management
- [ ] Hafalan tracking
- [ ] Analytics and reports
- [ ] Import/Export functionality
- [ ] PDF report generation

## Migration Status

This is a work-in-progress migration from Laravel to Nuxt 3. The Laravel application is still intact in the parent directory and can be used as reference.

### Migration Plan

See `/docs/FULLSTACK_NUXT_MIGRATION_GUIDE.md` for the complete migration plan and progress.

## Database Schema

The Prisma schema is designed to match the existing Laravel database structure:

- **Users**: Authentication and user management
- **Roles & Permissions**: Role-based access control (equivalent to Spatie Laravel Permission)
- **Profiles**: Unified table for students, teachers, and guardians
- **Classes**: Class management
- **Surahs**: 114 Quran Surahs
- **Hafalans**: Memorization tracking
- **AuditLogs**: Activity logging

## Development Notes

- This is a separate directory (`hafalan-nuxt/`) from the Laravel app
- The Laravel app remains unchanged for reference
- Data migration from Laravel to Nuxt will be done after core features are implemented
- All API endpoints follow RESTful conventions
- Authentication uses HTTP-only cookies for security

## Support

For issues or questions, please refer to the documentation or contact the development team.

