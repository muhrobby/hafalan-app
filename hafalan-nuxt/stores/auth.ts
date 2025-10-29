import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
  emailVerifiedAt: string | null
  mustChangePassword: boolean
  roles: string[]
  permissions: string[]
  profile?: any
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),

  getters: {
    /**
     * Check if user has a specific role
     */
    hasRole: (state) => (role: string): boolean => {
      return state.user?.roles.includes(role) ?? false
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole: (state) => (roles: string[]): boolean => {
      return roles.some(role => state.user?.roles.includes(role)) ?? false
    },

    /**
     * Check if user has a specific permission
     */
    hasPermission: (state) => (permission: string): boolean => {
      return state.user?.permissions.includes(permission) ?? false
    },

    /**
     * Check if user has any of the specified permissions
     */
    hasAnyPermission: (state) => (permissions: string[]): boolean => {
      return permissions.some(perm => state.user?.permissions.includes(perm)) ?? false
    },

    /**
     * Check if user is admin
     */
    isAdmin: (state): boolean => {
      return state.user?.roles.includes('admin') ?? false
    },

    /**
     * Check if user is teacher
     */
    isTeacher: (state): boolean => {
      return state.user?.roles.includes('teacher') ?? false
    },

    /**
     * Check if user is guardian (wali)
     */
    isGuardian: (state): boolean => {
      return state.user?.roles.includes('wali') ?? false
    },

    /**
     * Check if user is student
     */
    isStudent: (state): boolean => {
      return state.user?.roles.includes('student') ?? false
    }
  },

  actions: {
    /**
     * Login with email and password
     */
    async login(email: string, password: string) {
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        })

        if (response.success) {
          this.user = response.data.user
          this.token = response.data.token
          this.isAuthenticated = true
          
          return response
        }
      } catch (error: any) {
        console.error('Login error:', error)
        throw error
      }
    },

    /**
     * Logout
     */
    async logout() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST'
        })

        this.user = null
        this.token = null
        this.isAuthenticated = false

        // Redirect to login page
        await navigateTo('/login')
      } catch (error) {
        console.error('Logout error:', error)
        throw error
      }
    },

    /**
     * Fetch current user session
     */
    async fetchUser() {
      try {
        const response = await $fetch('/api/auth/session')

        if (response.success) {
          this.user = response.data.user
          this.isAuthenticated = true
          return response.data.user
        }
      } catch (error: any) {
        // If 401, user is not authenticated
        if (error.statusCode === 401) {
          this.user = null
          this.isAuthenticated = false
        }
        throw error
      }
    },

    /**
     * Clear auth state
     */
    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
    }
  }
})
