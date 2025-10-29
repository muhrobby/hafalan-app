// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-10-29',
  
  devtools: { enabled: true },

  css: [
    '~/assets/css/main.css',
  ],

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  typescript: {
    strict: false,
    typeCheck: false,
  },

  runtimeConfig: {
    // Server-side only (private)
    databaseUrl: process.env.DATABASE_URL || '',
    jwtSecret: process.env.JWT_SECRET || 'super-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    
    // Public (client-side accessible)
    public: {
      appName: 'Hafalan App',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    }
  },

  nitro: {
    preset: 'node-server',
    experimental: {
      openAPI: true,
    },
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
