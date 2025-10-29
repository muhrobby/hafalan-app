import { extractToken, verifyToken } from '../utils/auth'
import prisma from '../utils/prisma'

/**
 * Authentication middleware
 * Validates JWT token and attaches user to event context
 */
export default defineEventHandler(async (event) => {
  // Skip auth for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/_nuxt',
    '/api/_content',
  ]
  
  const path = event.path || event.node.req.url || ''
  
  // Skip middleware untuk public routes
  if (publicRoutes.some(route => path.startsWith(route))) {
    return
  }
  
  // Skip middleware untuk non-API routes
  if (!path.startsWith('/api/')) {
    return
  }
  
  // Extract token dari header
  const authHeader = getHeader(event, 'authorization')
  const token = extractToken(authHeader)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }
  
  // Verify token
  const payload = verifyToken(token)
  
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token',
    })
  }
  
  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
      profile: true,
    },
  })
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'User not found',
    })
  }
  
  if (!user.isActive) {
    throw createError({
      statusCode: 403,
      message: 'Account is inactive',
    })
  }
  
  // Attach user to event context
  event.context.user = user
})
