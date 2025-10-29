<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

// Initialize auth on app mount
onMounted(() => {
  authStore.initAuth()
})
</script>
