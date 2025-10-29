export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Get required roles from route meta
  const requiredRoles = to.meta.roles as string[] | undefined
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return
  }
  
  // Check if user has any of the required roles
  if (!authStore.hasAnyRole(requiredRoles)) {
    return navigateTo('/dashboard')
  }
})
