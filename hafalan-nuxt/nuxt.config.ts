// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@sidebase/nuxt-auth'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Private keys that are only available on the server
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    
    // Public keys that are exposed to the client
    public: {
      apiBase: '/api'
    }
  },

  auth: {
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'post' },
        signUp: { path: '/register', method: 'post' },
        getSession: { path: '/session', method: 'get' }
      },
      pages: {
        login: '/login'
      },
      token: {
        signInResponseTokenPointer: '/token',
        type: 'Bearer',
        cookieName: 'auth.token',
        headerName: 'Authorization',
        maxAgeInSeconds: 60 * 60 * 24 * 7, // 7 days
        sameSiteAttribute: 'lax'
      },
      sessionDataType: { id: 'string', email: 'string', name: 'string' }
    },
    globalAppMiddleware: {
      isEnabled: true
    }
  },

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  }
})
