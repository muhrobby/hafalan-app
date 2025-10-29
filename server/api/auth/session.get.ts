import { getUserFromEvent, sanitizeUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = getUserFromEvent(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated',
    })
  }
  
  return {
    user: sanitizeUser(user),
  }
})
