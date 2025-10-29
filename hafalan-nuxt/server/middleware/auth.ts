import type { H3Event } from 'h3'
import { getUserFromToken } from '../utils/auth'

/**
 * Server middleware to check authentication
 * Attaches user to event.context if authenticated
 */
export default defineEventHandler(async (event: H3Event) => {
  // Skip auth check for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/_nuxt',
    '/api/_content'
  ]

  const path = event.node.req.url || ''
  
  // Skip public routes
  if (publicRoutes.some(route => path.startsWith(route))) {
    return
  }

  // Only check auth for API routes
  if (!path.startsWith('/api/')) {
    return
  }

  // Try to get token from cookie or Authorization header
  let token: string | null = null

  // Check cookie first
  const cookieToken = getCookie(event, 'auth.token')
  if (cookieToken) {
    token = cookieToken
  }

  // Check Authorization header
  const authHeader = getHeader(event, 'authorization')
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }

  // If no token, continue (individual routes will handle unauthorized access)
  if (!token) {
    return
  }

  // Verify token and get user
  const user = await getUserFromToken(token)
  
  if (user) {
    // Attach user to event context
    event.context.user = user
  }
})
