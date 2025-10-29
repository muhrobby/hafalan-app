# 🕌 Hafalan App - Full-Stack Nuxt 3

Sistem Manajemen Hafalan Al-Quran menggunakan Full-Stack Nuxt 3

## 🚀 Tech Stack

- **Nuxt 3** - Full-stack Vue framework
- **Prisma** - Next-generation ORM
- **MySQL/PostgreSQL** - Database
- **Nuxt UI** - UI components
- **Pinia** - State management
- **TailwindCSS** - Styling
- **TypeScript** - Type safety
- **JWT** - Authentication

## 📦 Installation

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Run development server
npm run dev
```

## 🏗️ Project Structure

```
hafalan-nuxt/
├── server/          # Server-side code
│   ├── api/        # API endpoints
│   ├── middleware/ # Server middleware
│   ├── utils/      # Server utilities
│   └── services/   # Business logic
├── prisma/         # Database schema & migrations
├── pages/          # File-based routing
├── components/     # Vue components
├── composables/    # Vue composables
├── layouts/        # Layouts
├── stores/         # Pinia stores
├── types/          # TypeScript types
└── utils/          # Client utilities
```

## 🔧 Development

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="mysql://user:password@localhost:3306/hafalan"
JWT_SECRET="your-secret-key"
APP_URL="http://localhost:3000"
```

## 🎯 Features

- ✅ Authentication & Authorization (JWT + Role-based)
- ✅ User Management (Admin, Teacher, Guardian, Student)
- ✅ Student Management with NIS auto-generation
- ✅ Teacher Management with NIP auto-generation
- ✅ Guardian-Student relationships
- ✅ Hafalan (Quran memorization) tracking
- ✅ Analytics & Reports
- ✅ Import/Export (CSV, Excel)
- ✅ PDF Report generation
- ✅ Audit logging

## 📚 Documentation

See `/docs/FULLSTACK_NUXT_MIGRATION_GUIDE.md` for complete migration guide.

## 🔐 Default Login

```
Email: admin@example.com
Password: password
```

## 📄 License

MIT
