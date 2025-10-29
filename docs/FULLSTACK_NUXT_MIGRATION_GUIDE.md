# 🚀 Full-Stack Nuxt Migration Guide - Step by Step

## 📋 Overview

Migrasi dari **Laravel + Inertia.js + React** ke **Full-Stack Nuxt 3**

**Target Architecture:**
- ❌ Remove: Laravel, Inertia.js, React
- ✅ Add: Nuxt 3 (Full-Stack)
- ✅ Add: Prisma ORM (replacement untuk Eloquent)
- ✅ Add: Nitro Server (built-in Nuxt server)
- ✅ Keep: PostgreSQL/MySQL Database
- ✅ Keep: Business Logic & Data Structure

**Estimated Time:** 6-8 weeks
**Difficulty:** High

---

## 🎯 Phase 0: Preparation & Analysis (Week 1)

### Step 0.1: Backup Everything
```bash
# Backup database
mysqldump -u root -p hafalan_app > backup_$(date +%Y%m%d).sql

# Backup codebase
git checkout -b backup-before-migration
git commit -am "Backup before Nuxt migration"
git push origin backup-before-migration

# Create new branch
git checkout -b feature/fullstack-nuxt-migration
```

### Step 0.2: Document Current Database Schema
```bash
# Export database schema
php artisan schema:dump

# Document all tables
mysql -u root -p hafalan_app -e "SHOW TABLES;" > docs/database-tables.txt

# Document relationships
# Create diagram using dbdiagram.io or similar
```

**Database Tables to Document:**
- ✅ users
- ✅ profiles
- ✅ students (legacy)
- ✅ teachers (legacy)
- ✅ guardians (legacy)
- ✅ classes
- ✅ hafalans
- ✅ surahs
- ✅ guardian_student
- ✅ class_teacher
- ✅ roles
- ✅ permissions
- ✅ model_has_roles
- ✅ model_has_permissions
- ✅ role_has_permissions
- ✅ audit_logs

### Step 0.3: Export Current Data
```bash
# Export all data to JSON/CSV for migration
php artisan tinker
```

```php
// Export data script
use App\Models\{User, Profile, Classe, Surah, Hafalan, AuditLog};
use Spatie\Permission\Models\{Role, Permission};

// Export to JSON files
file_put_contents('migration-data/users.json', User::with('roles')->get()->toJson());
file_put_contents('migration-data/profiles.json', Profile::all()->toJson());
file_put_contents('migration-data/classes.json', Classe::all()->toJson());
file_put_contents('migration-data/surahs.json', Surah::all()->toJson());
file_put_contents('migration-data/hafalans.json', Hafalan::all()->toJson());
file_put_contents('migration-data/roles.json', Role::with('permissions')->get()->toJson());
file_put_contents('migration-data/permissions.json', Permission::all()->toJson());
```

### Step 0.4: Analyze Dependencies

**Current Laravel Dependencies:**
```json
{
  "laravel/framework": "^12.0",
  "laravel/fortify": "^1.30",
  "spatie/laravel-permission": "^6.21",
  "maatwebsite/excel": "^3.1",
  "barryvdh/laravel-dompdf": "^3.1"
}
```

**Nuxt Equivalents:**
- Authentication: `@sidebase/nuxt-auth` or `@nuxt/auth`
- Permissions: Custom implementation with Prisma
- Excel: `xlsx` or `exceljs`
- PDF: `pdfkit` or `jspdf`

---

## 🏗️ Phase 1: Setup Nuxt Full-Stack Project (Week 1-2)

### Step 1.1: Initialize Nuxt Project

```bash
# Create new directory for Nuxt project
mkdir hafalan-nuxt
cd hafalan-nuxt

# Initialize Nuxt 3
npx nuxi@latest init .

# Select options:
# - Package manager: npm
# - TypeScript: Yes
```

### Step 1.2: Install Core Dependencies

```bash
# Install essential packages
npm install -D @nuxtjs/tailwindcss

# Database & ORM
npm install prisma @prisma/client
npm install -D prisma

# Authentication
npm install @sidebase/nuxt-auth
npm install bcrypt
npm install -D @types/bcrypt

# Form validation
npm install zod
npm install vee-validate @vee-validate/zod

# UI Components
npm install @nuxt/ui
npm install @nuxt/icon

# State management
npm install pinia @pinia/nuxt

# Excel import/export
npm install xlsx
npm install exceljs

# PDF generation
npm install jspdf jspdf-autotable

# Date utilities
npm install date-fns

# Charts
npm install vue-chartjs chart.js

# Additional utilities
npm install @vueuse/core @vueuse/nuxt
```

### Step 1.3: Project Structure Setup

```bash
# Create directory structure
mkdir -p server/api
mkdir -p server/middleware
mkdir -p server/utils
mkdir -p server/models
mkdir -p server/services
mkdir -p prisma
mkdir -p composables
mkdir -p components/ui
mkdir -p components/forms
mkdir -p components/tables
mkdir -p components/charts
mkdir -p layouts
mkdir -p pages
mkdir -p stores
mkdir -p types
mkdir -p utils
mkdir -p assets/css
mkdir -p public/images
```

**Final Structure:**
```
hafalan-nuxt/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── server/
│   ├── api/              # API endpoints
│   │   ├── auth/
│   │   ├── users/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── guardians/
│   │   ├── classes/
│   │   ├── hafalan/
│   │   └── analytics/
│   ├── middleware/       # Server middleware
│   ├── utils/           # Server utilities
│   ├── services/        # Business logic
│   └── models/          # Additional models
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   ├── tables/          # Table components
│   ├── charts/          # Chart components
│   └── layout/          # Layout components
├── composables/         # Vue composables
├── layouts/             # Nuxt layouts
├── pages/               # File-based routing
├── stores/              # Pinia stores
├── types/               # TypeScript types
├── utils/               # Client utilities
├── assets/              # CSS, images
├── public/              # Static files
├── nuxt.config.ts
├── tsconfig.json
└── package.json
```

### Step 1.4: Configure Nuxt

**nuxt.config.ts:**
```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@sidebase/nuxt-auth',
  ],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  runtimeConfig: {
    // Server-side only
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    
    // Public (client-side)
    public: {
      appName: 'Hafalan App',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    }
  },

  nitro: {
    preset: 'node-server',
    experimental: {
      openAPI: true, // Enable OpenAPI documentation
    },
  },

  auth: {
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/api/auth/login', method: 'post' },
        signOut: { path: '/api/auth/logout', method: 'post' },
        signUp: { path: '/api/auth/register', method: 'post' },
        getSession: { path: '/api/auth/session', method: 'get' },
      },
      pages: {
        login: '/login',
      },
      token: {
        signInResponseTokenPointer: '/token',
      },
      session: {
        dataType: {
          id: 'number',
          email: 'string',
          name: 'string',
          roles: 'array',
        },
      },
    },
    globalAppMiddleware: true,
  },

  app: {
    head: {
      title: 'Hafalan App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistem Manajemen Hafalan Al-Quran' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  ssr: true,
})
```

### Step 1.5: Environment Variables

**.env:**
```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/hafalan_nuxt"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# App
APP_URL="http://localhost:3000"
NODE_ENV="development"

# Email (for later)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
```

---

## 🗄️ Phase 2: Database Setup with Prisma (Week 2)

### Step 2.1: Initialize Prisma

```bash
npx prisma init
```

### Step 2.2: Create Prisma Schema

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ============= USER & AUTH =============
model User {
  id                    Int       @id @default(autoincrement())
  name                  String
  email                 String    @unique
  emailVerifiedAt       DateTime? @map("email_verified_at")
  password              String
  rememberToken         String?   @map("remember_token") @db.VarChar(100)
  twoFactorSecret       String?   @map("two_factor_secret") @db.Text
  twoFactorRecoveryCodes String?  @map("two_factor_recovery_codes") @db.Text
  twoFactorConfirmedAt  DateTime? @map("two_factor_confirmed_at")
  mustChangePassword    Boolean   @default(false) @map("must_change_password")
  passwordChangedAt     DateTime? @map("password_changed_at")
  temporaryPasswordSetAt DateTime? @map("temporary_password_set_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  // Relations
  profile      Profile?
  roles        UserRole[]
  auditLogs    AuditLog[]
  
  @@map("users")
}

model Role {
  id          Int        @id @default(autoincrement())
  name        String     @unique
  guardName   String     @default("web") @map("guard_name")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  users       UserRole[]
  permissions RolePermission[]

  @@map("roles")
}

model Permission {
  id          Int        @id @default(autoincrement())
  name        String     @unique
  guardName   String     @default("web") @map("guard_name")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  roles       RolePermission[]

  @@map("permissions")
}

model UserRole {
  userId    Int  @map("user_id")
  roleId    Int  @map("role_id")
  
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("model_has_roles")
}

model RolePermission {
  roleId       Int        @map("role_id")
  permissionId Int        @map("permission_id")
  
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@map("role_has_permissions")
}

// ============= PROFILES =============
model Profile {
  id          Int       @id @default(autoincrement())
  userId      Int       @unique @map("user_id")
  nis         String?   @unique
  nip         String?   @unique
  phone       String?
  birthDate   DateTime? @map("birth_date")
  address     String?   @db.Text
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  user           User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  studentClasses StudentClass[]
  teacherClasses TeacherClass[]
  guardianStudents GuardianStudent[]
  studentGuardians StudentGuardian[]
  hafalans       Hafalan[]

  @@map("profiles")
}

// ============= CLASSES =============
model Classe {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  students  StudentClass[]
  teachers  TeacherClass[]

  @@map("classes")
}

model StudentClass {
  studentId Int     @map("student_id")
  classId   Int     @map("class_id")
  
  student   Profile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  class     Classe  @relation(fields: [classId], references: [id], onDelete: Cascade)

  @@id([studentId, classId])
  @@map("student_class")
}

model TeacherClass {
  teacherId Int     @map("teacher_id")
  classId   Int     @map("class_id")
  
  teacher   Profile @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  class     Classe  @relation(fields: [classId], references: [id], onDelete: Cascade)

  @@id([teacherId, classId])
  @@map("class_teacher")
}

// ============= GUARDIAN-STUDENT RELATIONSHIP =============
model GuardianStudent {
  guardianId Int     @map("guardian_id")
  studentId  Int     @map("student_id")
  
  guardian   Profile @relation(fields: [guardianId], references: [id], onDelete: Cascade)
  student    Profile @relation("StudentGuardians", fields: [studentId], references: [id], onDelete: Cascade)

  @@id([guardianId, studentId])
  @@map("guardian_student")
}

model StudentGuardian {
  studentId  Int     @map("student_id")
  guardianId Int     @map("guardian_id")
  
  student    Profile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  guardian   Profile @relation("GuardianStudents", fields: [guardianId], references: [id], onDelete: Cascade)

  @@id([studentId, guardianId])
  @@map("student_guardian")
}

// ============= HAFALAN =============
model Surah {
  id        Int      @id @default(autoincrement())
  number    Int      @unique
  name      String
  nameArabic String  @map("name_arabic")
  verses    Int
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  hafalans  Hafalan[]

  @@map("surahs")
}

model Hafalan {
  id          Int      @id @default(autoincrement())
  profileId   Int      @map("profile_id")
  surahId     Int      @map("surah_id")
  verseStart  Int      @map("verse_start")
  verseEnd    Int      @map("verse_end")
  score       Int
  notes       String?  @db.Text
  date        DateTime
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  surah       Surah    @relation(fields: [surahId], references: [id], onDelete: Cascade)

  @@index([profileId])
  @@index([surahId])
  @@index([date])
  @@map("hafalans")
}

// ============= AUDIT LOGS =============
model AuditLog {
  id          Int      @id @default(autoincrement())
  userId      Int?     @map("user_id")
  action      String
  model       String
  modelId     Int?     @map("model_id")
  changes     String?  @db.Text
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  createdAt   DateTime @default(now()) @map("created_at")

  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([model])
  @@index([createdAt])
  @@map("audit_logs")
}
```

### Step 2.3: Create Migration from Existing Database

```bash
# Pull existing schema from Laravel database
npx prisma db pull

# This will generate schema from your existing database
# Review and adjust the generated schema

# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Step 2.4: Create Prisma Seed File

**prisma/seed.ts:**
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      guardName: 'web',
    },
  })

  const teacherRole = await prisma.role.upsert({
    where: { name: 'teacher' },
    update: {},
    create: {
      name: 'teacher',
      guardName: 'web',
    },
  })

  const guardianRole = await prisma.role.upsert({
    where: { name: 'wali' },
    update: {},
    create: {
      name: 'wali',
      guardName: 'web',
    },
  })

  const studentRole = await prisma.role.upsert({
    where: { name: 'student' },
    update: {},
    create: {
      name: 'student',
      guardName: 'web',
    },
  })

  // Create permissions
  const permissions = [
    'view-users', 'create-users', 'edit-users', 'delete-users',
    'view-students', 'create-students', 'edit-students', 'delete-students',
    'view-teachers', 'create-teachers', 'edit-teachers', 'delete-teachers',
    'view-guardians', 'create-guardians', 'edit-guardians', 'delete-guardians',
    'view-hafalan', 'create-hafalan', 'edit-hafalan', 'delete-hafalan',
    'view-analytics', 'export-data', 'import-data',
  ]

  for (const permName of permissions) {
    await prisma.permission.upsert({
      where: { name: permName },
      update: {},
      create: {
        name: permName,
        guardName: 'web',
      },
    })
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('password', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      emailVerifiedAt: new Date(),
    },
  })

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  // Create profile for admin
  await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      phone: '08123456789',
    },
  })

  // Seed Surahs (114 surahs)
  const surahs = [
    { number: 1, name: "Al-Fatihah", nameArabic: "الفاتحة", verses: 7 },
    { number: 2, name: "Al-Baqarah", nameArabic: "البقرة", verses: 286 },
    { number: 3, name: "Ali 'Imran", nameArabic: "آل عمران", verses: 200 },
    // ... add all 114 surahs
    { number: 114, name: "An-Nas", nameArabic: "الناس", verses: 6 },
  ]

  for (const surah of surahs) {
    await prisma.surah.upsert({
      where: { number: surah.number },
      update: {},
      create: surah,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Add to package.json:**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

```bash
# Install tsx for running TypeScript
npm install -D tsx

# Run seed
npx prisma db seed
```

---

## 🔐 Phase 3: Authentication System (Week 3)

### Step 3.1: Create Auth Utilities

**server/utils/auth.ts:**
```typescript
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function generateToken(userId: number): string {
  const config = useRuntimeConfig()
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: '7d',
  })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtSecret) as { userId: number }
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null

  return await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      profile: true,
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })
}
```

### Step 3.2: Create Auth Middleware

**server/middleware/auth.ts:**
```typescript
export default defineEventHandler(async (event) => {
  // Skip auth for public routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register']
  if (publicRoutes.some(route => event.path.startsWith(route))) {
    return
  }

  // Check if route requires auth
  if (event.path.startsWith('/api/')) {
    const token = getCookie(event, 'auth-token') || 
                  getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid token',
      })
    }

    // Attach user to event context
    event.context.user = user
  }
})
```

### Step 3.3: Create Auth API Endpoints

**server/api/auth/login.post.ts:**
```typescript
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation error',
      data: result.error.errors,
    })
  }

  const { email, password } = result.data

  // Find user
  const prisma = new PrismaClient()
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  }

  // Generate token
  const token = generateToken(user.id)

  // Set cookie
  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // Return user data
  return {
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        roles: user.roles.map(ur => ur.role.name),
        permissions: user.roles.flatMap(ur => 
          ur.role.permissions.map(rp => rp.permission.name)
        ),
      },
      token,
    },
  }
})
```

**server/api/auth/logout.post.ts:**
```typescript
export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth-token')
  
  return {
    success: true,
    message: 'Logged out successfully',
  }
})
```

**server/api/auth/session.get.ts:**
```typescript
export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated',
    })
  }

  return {
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      roles: user.roles.map(ur => ur.role.name),
      permissions: user.roles.flatMap(ur => 
        ur.role.permissions.map(rp => rp.permission.name)
      ),
    },
  }
})
```

### Step 3.4: Create Auth Store (Pinia)

**stores/auth.ts:**
```typescript
import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
  profile?: any
  roles: string[]
  permissions: string[]
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
  }),

  getters: {
    hasRole: (state) => (role: string) => {
      return state.user?.roles?.includes(role) ?? false
    },
    
    hasPermission: (state) => (permission: string) => {
      return state.user?.permissions?.includes(permission) ?? false
    },

    hasAnyRole: (state) => (roles: string[]) => {
      return roles.some(role => state.user?.roles?.includes(role)) ?? false
    },

    isAdmin: (state) => {
      return state.user?.roles?.includes('admin') ?? false
    },

    isTeacher: (state) => {
      return state.user?.roles?.includes('teacher') ?? false
    },

    isGuardian: (state) => {
      return state.user?.roles?.includes('wali') ?? false
    },

    isStudent: (state) => {
      return state.user?.roles?.includes('student') ?? false
    },
  },

  actions: {
    async login(email: string, password: string) {
      const { data, error } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      if (error.value) {
        throw new Error(error.value.data?.message || 'Login failed')
      }

      this.user = data.value?.data.user || null
      this.isAuthenticated = true
    },

    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
      this.isAuthenticated = false
      navigateTo('/login')
    },

    async fetchUser() {
      try {
        const { data } = await useFetch('/api/auth/session')
        if (data.value?.data) {
          this.user = data.value.data
          this.isAuthenticated = true
        }
      } catch {
        this.user = null
        this.isAuthenticated = false
      }
    },
  },
})
```

### Step 3.5: Create Login Page

**pages/login.vue:**
```vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <h2 class="text-2xl font-bold text-center">Login</h2>
        <p class="text-sm text-gray-600 text-center mt-1">Hafalan App</p>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <UFormGroup label="Email" :error="errors.email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="admin@example.com"
            required
          />
        </UFormGroup>

        <UFormGroup label="Password" :error="errors.password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          :loading="loading"
          size="lg"
        >
          Login
        </UButton>
      </form>

      <template #footer>
        <p class="text-sm text-center text-gray-600">
          Lupa password? Hubungi administrator
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  errors.email = ''
  errors.password = ''

  try {
    await authStore.login(form.email, form.password)
    toast.add({
      title: 'Login berhasil',
      description: `Selamat datang, ${authStore.user?.name}`,
      color: 'green',
    })
    router.push('/dashboard')
  } catch (error: any) {
    toast.add({
      title: 'Login gagal',
      description: error.message || 'Email atau password salah',
      color: 'red',
    })
  } finally {
    loading.value = false
  }
}
</script>
```

### Step 3.6: Create Middleware

**middleware/auth.ts:**
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
```

**middleware/guest.ts:**
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})
```

**middleware/role.ts:**
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  const requiredRole = to.meta.role as string | string[]

  if (!requiredRole) return

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  if (!authStore.hasAnyRole(roles)) {
    return navigateTo('/unauthorized')
  }
})
```

---

## 🎨 Phase 4: UI Components & Layouts (Week 3-4)

### Step 4.1: Create Main Layout

**layouts/default.vue:**
```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out z-30"
      :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-4 border-b">
          <h1 class="text-xl font-bold">Hafalan App</h1>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            class="md:hidden"
            @click="sidebarOpen = false"
          />
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <SidebarLink
            to="/dashboard"
            icon="i-heroicons-home"
            label="Dashboard"
          />

          <SidebarLink
            v-if="authStore.hasPermission('view-students')"
            to="/students"
            icon="i-heroicons-academic-cap"
            label="Santri"
          />

          <SidebarLink
            v-if="authStore.hasPermission('view-teachers')"
            to="/teachers"
            icon="i-heroicons-user-group"
            label="Guru"
          />

          <SidebarLink
            v-if="authStore.hasPermission('view-guardians')"
            to="/guardians"
            icon="i-heroicons-users"
            label="Wali Santri"
          />

          <SidebarLink
            v-if="authStore.hasPermission('view-hafalan')"
            to="/hafalan"
            icon="i-heroicons-book-open"
            label="Hafalan"
          />

          <SidebarLink
            v-if="authStore.hasPermission('view-analytics')"
            to="/analytics"
            icon="i-heroicons-chart-bar"
            label="Analytics"
          />

          <SidebarLink
            v-if="authStore.isAdmin"
            to="/users"
            icon="i-heroicons-user-circle"
            label="Users"
          />
        </nav>

        <!-- User menu -->
        <div class="p-4 border-t">
          <UDropdown :items="userMenuItems">
            <UButton
              color="gray"
              variant="ghost"
              block
              trailing-icon="i-heroicons-chevron-up-down"
            >
              <div class="flex items-center gap-2">
                <UAvatar :alt="authStore.user?.name" size="sm" />
                <div class="text-left">
                  <p class="text-sm font-medium">{{ authStore.user?.name }}</p>
                  <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
                </div>
              </div>
            </UButton>
          </UDropdown>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="md:pl-64">
      <!-- Top Bar -->
      <header class="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4">
          <UButton
            icon="i-heroicons-bars-3"
            color="gray"
            variant="ghost"
            class="md:hidden"
            @click="sidebarOpen = true"
          />
          
          <div class="flex-1" />

          <!-- Notifications -->
          <UButton
            icon="i-heroicons-bell"
            color="gray"
            variant="ghost"
          />
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const userMenuItems = [
  [{
    label: 'Profile',
    icon: 'i-heroicons-user',
    click: () => navigateTo('/profile'),
  }],
  [{
    label: 'Settings',
    icon: 'i-heroicons-cog',
    click: () => navigateTo('/settings'),
  }],
  [{
    label: 'Logout',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: () => authStore.logout(),
  }],
]
</script>
```

**components/SidebarLink.vue:**
```vue
<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
    :class="[
      isActive 
        ? 'bg-primary-50 text-primary-600' 
        : 'text-gray-700 hover:bg-gray-100'
    ]"
  >
    <UIcon :name="icon" class="w-5 h-5" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  to: string
  icon: string
  label: string
}>()

const route = useRoute()
const isActive = computed(() => route.path.startsWith(props.to))
</script>
```

### Step 4.2: Create Dashboard Page

**pages/dashboard.vue:**
```vue
<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="text-gray-600">Selamat datang, {{ authStore.user?.name }}</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Santri"
        :value="stats.students"
        icon="i-heroicons-academic-cap"
        color="blue"
      />
      <StatsCard
        title="Total Guru"
        :value="stats.teachers"
        icon="i-heroicons-user-group"
        color="green"
      />
      <StatsCard
        title="Total Wali"
        :value="stats.guardians"
        icon="i-heroicons-users"
        color="purple"
      />
      <StatsCard
        title="Total Kelas"
        :value="stats.classes"
        icon="i-heroicons-building-library"
        color="orange"
      />
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Hafalan Progress</h3>
        </template>
        <div class="h-64">
          <LineChart :data="chartData" />
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Recent Activity</h3>
        </template>
        <div class="space-y-3">
          <ActivityItem
            v-for="activity in recentActivities"
            :key="activity.id"
            :activity="activity"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()

// Fetch stats
const { data: stats } = await useFetch('/api/dashboard/stats')

// Fetch chart data
const { data: chartData } = await useFetch('/api/dashboard/chart-data')

// Fetch activities
const { data: recentActivities } = await useFetch('/api/dashboard/activities')
</script>
```

---

## 📊 Phase 5: CRUD Modules Migration (Week 4-5)

### Step 5.1: Students Module

**server/api/students/index.get.ts:**
```typescript
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const perPage = Number(query.per_page) || 15
  const search = query.search as string || ''

  const prisma = new PrismaClient()

  const where = {
    nis: { not: null },
    ...(search && {
      OR: [
        { nis: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ],
    }),
  }

  const [students, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
        studentClasses: {
          include: {
            class: true,
          },
        },
        studentGuardians: {
          include: {
            guardian: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.profile.count({ where }),
  ])

  return {
    success: true,
    data: students,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: Math.ceil(total / perPage),
    },
  }
})
```

**server/api/students/index.post.ts:**
```typescript
import { z } from 'zod'

const createStudentSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  classId: z.number().optional(),
  guardianId: z.number().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const result = createStudentSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation error',
      data: result.error.errors,
    })
  }

  const { name, email, phone, birthDate, classId, guardianId } = result.data

  const prisma = new PrismaClient()

  // Check if email exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: 'Email already exists',
    })
  }

  // Generate NIS
  const nis = await generateNIS()

  // Create user and profile in transaction
  const student = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: await hashPassword('password123'), // Default password
        mustChangePassword: true,
      },
    })

    // Assign student role
    const studentRole = await tx.role.findUnique({
      where: { name: 'student' },
    })

    if (studentRole) {
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: studentRole.id,
        },
      })
    }

    // Create profile
    const profile = await tx.profile.create({
      data: {
        userId: user.id,
        nis,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    })

    // Add to class if provided
    if (classId) {
      await tx.studentClass.create({
        data: {
          studentId: profile.id,
          classId,
        },
      })
    }

    // Add guardian relationship if provided
    if (guardianId) {
      await tx.guardianStudent.create({
        data: {
          studentId: profile.id,
          guardianId,
        },
      })
    }

    return profile
  })

  // Log activity
  await logActivity(event, 'create', 'Student', student.id)

  return {
    success: true,
    message: 'Student created successfully',
    data: student,
  }
})

async function generateNIS(): Promise<string> {
  const prisma = new PrismaClient()
  const now = new Date()
  const prefix = now.toISOString().slice(2, 10).replace(/-/g, '')

  const latest = await prisma.profile.findFirst({
    where: {
      nis: {
        startsWith: prefix,
      },
    },
    orderBy: {
      nis: 'desc',
    },
  })

  let sequence = 1
  if (latest && latest.nis) {
    const lastSequence = parseInt(latest.nis.slice(prefix.length))
    sequence = lastSequence + 1
  }

  return `${prefix}${sequence.toString().padStart(6, '0')}`
}
```

**pages/students/index.vue:**
```vue
<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Santri</h1>
      <UButton
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        Tambah Santri
      </UButton>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="flex gap-4">
        <UInput
          v-model="search"
          placeholder="Cari santri..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
        />
        <UButton
          icon="i-heroicons-arrow-down-tray"
          color="gray"
          @click="exportData"
        >
          Export
        </UButton>
      </div>
    </UCard>

    <!-- Table -->
    <UCard>
      <UTable
        :rows="students"
        :columns="columns"
        :loading="loading"
      >
        <template #actions="{ row }">
          <UDropdown :items="getRowActions(row)">
            <UButton
              icon="i-heroicons-ellipsis-vertical"
              color="gray"
              variant="ghost"
            />
          </UDropdown>
        </template>
      </UTable>

      <template #footer>
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Showing {{ students.length }} of {{ total }} students
          </div>
          <UPagination
            v-model="page"
            :total="total"
            :per-page="perPage"
          />
        </div>
      </template>
    </UCard>

    <!-- Create Modal -->
    <StudentFormModal
      v-model="showCreateModal"
      @success="refresh"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  role: ['admin', 'teacher'],
})

const page = ref(1)
const perPage = ref(15)
const search = ref('')
const showCreateModal = ref(false)

const { data, pending: loading, refresh } = await useFetch('/api/students', {
  query: {
    page,
    per_page: perPage,
    search,
  },
  watch: [page, search],
})

const students = computed(() => data.value?.data || [])
const total = computed(() => data.value?.meta?.total || 0)

const columns = [
  { key: 'nis', label: 'NIS' },
  { key: 'user.name', label: 'Nama' },
  { key: 'user.email', label: 'Email' },
  { key: 'studentClasses[0].class.name', label: 'Kelas' },
  { key: 'actions', label: 'Aksi' },
]

const getRowActions = (row: any) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil',
    click: () => editStudent(row),
  }],
  [{
    label: 'Delete',
    icon: 'i-heroicons-trash',
    click: () => deleteStudent(row),
  }],
]

const editStudent = (student: any) => {
  // Implement edit
}

const deleteStudent = async (student: any) => {
  // Implement delete
}

const exportData = async () => {
  // Implement export
}
</script>
```

*(Continue dengan modules lain: Teachers, Guardians, Classes, Hafalan)*

---

## 🧪 Phase 6: Testing & Migration (Week 5-6)

### Step 6.1: Data Migration Script

**scripts/migrate-data.ts:**
```typescript
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function migrateData() {
  console.log('🚀 Starting data migration...')

  // Read exported data
  const users = JSON.parse(fs.readFileSync('migration-data/users.json', 'utf-8'))
  const profiles = JSON.parse(fs.readFileSync('migration-data/profiles.json', 'utf-8'))
  const classes = JSON.parse(fs.readFileSync('migration-data/classes.json', 'utf-8'))
  const surahs = JSON.parse(fs.readFileSync('migration-data/surahs.json', 'utf-8'))
  const hafalans = JSON.parse(fs.readFileSync('migration-data/hafalans.json', 'utf-8'))

  // Migrate users
  console.log('📝 Migrating users...')
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        emailVerifiedAt: user.email_verified_at,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
      },
    })
  }

  // Migrate profiles
  console.log('👤 Migrating profiles...')
  for (const profile of profiles) {
    await prisma.profile.create({
      data: {
        id: profile.id,
        userId: profile.user_id,
        nis: profile.nis,
        nip: profile.nip,
        phone: profile.phone,
        birthDate: profile.birth_date ? new Date(profile.birth_date) : null,
        address: profile.address,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
      },
    })
  }

  // Continue with other data...

  console.log('✅ Data migration completed!')
}

migrateData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### Step 6.2: Testing Checklist

```bash
# Run tests
npm run test

# Manual testing checklist:
```

**Authentication:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Session persistence
- [ ] Password reset
- [ ] 2FA enable/disable

**User Management:**
- [ ] List users with pagination
- [ ] Search users
- [ ] Create new user
- [ ] Edit user
- [ ] Delete user
- [ ] Import users from CSV
- [ ] Export users to Excel

**Students Module:**
- [ ] List students
- [ ] Create student
- [ ] Edit student
- [ ] Delete student
- [ ] Assign to class
- [ ] Link to guardian
- [ ] Import/Export

**Teachers Module:**
- [ ] Similar to students

**Guardians Module:**
- [ ] Similar to students

**Hafalan Module:**
- [ ] Create hafalan entry
- [ ] View hafalan history
- [ ] Calculate scores
- [ ] Generate reports

**Analytics:**
- [ ] View dashboard
- [ ] View charts
- [ ] Filter by date range
- [ ] Export reports

### Step 6.3: Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/students

# Lighthouse audit
npx lighthouse http://localhost:3000 --view
```

### Step 6.4: Deployment Preparation

**Build for production:**
```bash
# Build Nuxt
npm run build

# Preview production build
npm run preview

# Check bundle size
npx nuxt analyze
```

---

## 🚀 Phase 7: Deployment (Week 6)

### Step 7.1: Environment Setup

**Production .env:**
```env
DATABASE_URL="mysql://user:pass@prod-server:3306/hafalan_prod"
JWT_SECRET="super-secret-production-key-change-this"
NODE_ENV="production"
APP_URL="https://hafalan-app.com"
```

### Step 7.2: Deploy to Vercel/Netlify/Your Server

**Using Vercel:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Using Docker:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

```bash
docker build -t hafalan-nuxt .
docker run -p 3000:3000 --env-file .env hafalan-nuxt
```

### Step 7.3: Database Migration

```bash
# Run migrations on production
npx prisma migrate deploy

# Seed production data
npx prisma db seed
```

### Step 7.4: Post-Deployment

- [ ] Verify all endpoints working
- [ ] Test authentication flow
- [ ] Check data integrity
- [ ] Monitor error logs
- [ ] Setup monitoring (Sentry, LogRocket)
- [ ] Setup backup cron jobs

---

## ✅ Final Checklist

### Pre-Launch
- [ ] All data migrated successfully
- [ ] All features tested
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Backup system in place
- [ ] Monitoring configured
- [ ] Documentation updated

### Launch
- [ ] Deploy to production
- [ ] DNS configured
- [ ] SSL certificate installed
- [ ] Users notified
- [ ] Training materials provided

### Post-Launch
- [ ] Monitor errors for 24h
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Performance optimization
- [ ] Feature enhancements

---

## 📚 Resources

- [Nuxt 3 Documentation](https://nuxt.com)
- [Prisma Documentation](https://prisma.io/docs)
- [Nitro Documentation](https://nitro.unjs.io)
- [Nuxt UI](https://ui.nuxt.com)
- [Vue 3 Documentation](https://vuejs.org)

---

**Last Updated:** 2025-10-29
**Version:** 1.0
**Status:** Ready for Implementation
