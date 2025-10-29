<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import '~/assets/css/main.css'

const authStore = useAuthStore()

// Initialize auth on app mount
onMounted(() => {
  authStore.initAuth()
})
</script>
