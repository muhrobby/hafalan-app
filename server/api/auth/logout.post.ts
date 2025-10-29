export default defineEventHandler(async (event) => {
  // Since we're using JWT, logout is handled client-side
  // by removing the token from storage
  // This endpoint exists for consistency and future extensions
  // (e.g., token blacklisting)
  
  return {
    message: 'Logged out successfully',
  }
})
