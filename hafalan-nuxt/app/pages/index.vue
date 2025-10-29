<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">Hafalan App - Nuxt 3</h1>
      <p class="text-gray-600">Redirecting...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false
})

const authStore = useAuthStore()

onMounted(async () => {
  try {
    // Try to fetch user session
    await authStore.fetchUser()
    
    // If successful, redirect to dashboard
    if (authStore.isAuthenticated) {
      await navigateTo('/dashboard')
    } else {
      await navigateTo('/login')
    }
  } catch (error) {
    // If failed, redirect to login
    await navigateTo('/login')
  }
})
</script>
