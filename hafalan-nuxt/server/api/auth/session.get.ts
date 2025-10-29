export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by auth middleware)
    const user = event.context.user

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Not authenticated'
      })
    }

    return {
      success: true,
      data: {
        user
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Session error:', error)
    throw createError({
      statusCode: 500,
      message: 'An error occurred while fetching session'
    })
  }
})
