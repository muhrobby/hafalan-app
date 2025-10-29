export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (!authStore.user && authStore.token) {
    await authStore.fetchUser()
  }
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
