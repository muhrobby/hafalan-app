import prisma from '../../utils/prisma'
import { verifyPassword, generateToken, sanitizeUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { email, password } = body
  
  // Validation
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required',
    })
  }
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
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
      message: 'Invalid credentials',
    })
  }
  
  // Check if active
  if (!user.isActive) {
    throw createError({
      statusCode: 403,
      message: 'Account is inactive',
    })
  }
  
  // Verify password
  const isValidPassword = await verifyPassword(password, user.password)
  
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  }
  
  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })
  
  // Generate token
  const roles = user.userRoles.map(ur => ur.role.name)
  const token = generateToken({
    userId: user.id,
    email: user.email,
    roles,
  })
  
  // Return sanitized user and token
  return {
    user: sanitizeUser(user),
    token,
  }
})
