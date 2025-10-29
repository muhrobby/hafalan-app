// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt'
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

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  typescript: {
    strict: true,
    typeCheck: false  // Disabled for now to avoid build issues
  }
})
