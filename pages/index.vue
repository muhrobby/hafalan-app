<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
    <div class="text-center">
      <div class="mb-8">
        <UIcon name="i-heroicons-book-open" class="w-20 h-20 text-primary-500 mx-auto mb-4" />
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Hafalan App
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Sistem Manajemen Hafalan Al-Quran
        </p>
      </div>
      
      <div class="space-y-4">
        <UButton
          to="/login"
          size="xl"
          block
          icon="i-heroicons-arrow-right-on-rectangle"
        >
          Login
        </UButton>
        
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Default: admin@example.com / password
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>
