export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Initialize auth from localStorage
  await authStore.initAuth()
})
