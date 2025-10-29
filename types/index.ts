// User & Auth Types
export interface User {
  id: number
  name: string
  email: string
  emailVerifiedAt?: Date
  mustChangePassword: boolean
  createdAt: Date
  updatedAt: Date
  profile?: Profile
  roles: Role[]
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
}

export interface Permission {
  id: number
  name: string
}

export interface Profile {
  id: number
  userId: number
  nis?: string
  nip?: string
  phone?: string
  birthDate?: Date
  address?: string
  createdAt: Date
  updatedAt: Date
}

// Academic Types
export interface Classe {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Surah {
  id: number
  number: number
  name: string
  nameArabic: string
  verses: number
  createdAt: Date
  updatedAt: Date
}

export interface Hafalan {
  id: number
  profileId: number
  surahId: number
  verseStart: number
  verseEnd: number
  score: number
  notes?: string
  date: Date
  createdAt: Date
  updatedAt: Date
  profile?: Profile
  surah?: Surah
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

// Form Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface StudentFormData {
  name: string
  email: string
  phone?: string
  birthDate?: string
  classId?: number
  guardianId?: number
}

export interface TeacherFormData {
  name: string
  email: string
  phone?: string
  classIds?: number[]
}

export interface GuardianFormData {
  name: string
  email: string
  phone?: string
  address?: string
  studentIds?: number[]
}

export interface HafalanFormData {
  profileId: number
  surahId: number
  verseStart: number
  verseEnd: number
  score: number
  notes?: string
  date: string
}
