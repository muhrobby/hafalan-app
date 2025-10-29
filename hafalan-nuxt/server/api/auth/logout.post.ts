export default defineEventHandler(async (event) => {
  try {
    // Clear auth cookie
    deleteCookie(event, 'auth.token', {
      path: '/'
    })

    return {
      success: true,
      message: 'Logout successful'
    }
  } catch (error) {
    console.error('Logout error:', error)
    throw createError({
      statusCode: 500,
      message: 'An error occurred during logout'
    })
  }
})
