import { defineStore } from 'pinia'
import type { User, Profile } from '@prisma/client'

interface SanitizedUser extends Omit<User, 'password' | 'twoFactorSecret'> {
  roles: string[]
  profile?: Profile | null
}

interface AuthState {
  user: SanitizedUser | null
  token: string | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    
    isAdmin: (state) => state.user?.roles.includes('admin') || false,
    
    isTeacher: (state) => state.user?.roles.includes('teacher') || false,
    
    isGuardian: (state) => state.user?.roles.includes('wali') || false,
    
    isStudent: (state) => state.user?.roles.includes('student') || false,
    
    hasRole: (state) => (role: string) => {
      return state.user?.roles.includes(role) || false
    },
    
    hasAnyRole: (state) => (roles: string[]) => {
      return roles.some(role => state.user?.roles.includes(role)) || false
    },

    // Check if user has permission (simplified - checks if admin or has specific role)
    hasPermission: (state) => (permission: string) => {
      // Admin has all permissions
      if (state.user?.roles.includes('admin')) return true
      
      // Map permissions to roles
      const permissionRoleMap: Record<string, string[]> = {
        'view_students': ['admin', 'teacher'],
        'view_teachers': ['admin'],
        'view_guardians': ['admin', 'teacher'],
        'view_classes': ['admin', 'teacher'],
        'view_hafalan': ['admin', 'teacher', 'wali'],
        'view_analytics': ['admin', 'teacher'],
        'manage_users': ['admin'],
        'view_audit_logs': ['admin'],
      }
      
      const requiredRoles = permissionRoleMap[permission] || []
      return requiredRoles.some(role => state.user?.roles.includes(role))
    },
  },
  
  actions: {
    async login(email: string, password: string) {
      this.loading = true
      
      try {
        const { user, token } = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        
        this.user = user
        this.token = token
        
        // Store token in localStorage
        if (process.client) {
          localStorage.setItem('auth_token', token)
        }
        
        return { success: true }
      } catch (error: any) {
        return {
          success: false,
          message: error.data?.message || 'Login failed',
        }
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST',
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        })
      } catch (error) {
        // Ignore errors
      } finally {
        this.user = null
        this.token = null
        
        if (process.client) {
          localStorage.removeItem('auth_token')
        }
        
        // Redirect to login
        navigateTo('/login')
      }
    },
    
    async fetchUser() {
      if (!this.token) {
        return
      }
      
      try {
        const { user } = await $fetch('/api/auth/session', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        
        this.user = user
      } catch (error) {
        // Token invalid, clear auth
        this.user = null
        this.token = null
        
        if (process.client) {
          localStorage.removeItem('auth_token')
        }
      }
    },
    
    async initAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth_token')
        
        if (token) {
          this.token = token
          await this.fetchUser()
        }
      }
    },
  },
})
