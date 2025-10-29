import { PrismaClient } from '@prisma/client'
import { hashPassword, verifyPassword, generateToken } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required'
      })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        profile: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    // Set token in cookie
    setCookie(event, 'auth.token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    // Extract roles and permissions
    const roles = user.roles.map(ur => ur.role.name)
    const permissions = user.roles.flatMap(ur => 
      ur.role.permissions.map(rp => rp.permission.name)
    )

    // Return user data (without password)
    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerifiedAt: user.emailVerifiedAt,
          mustChangePassword: user.mustChangePassword,
          roles,
          permissions: [...new Set(permissions)],
          profile: user.profile
        }
      },
      message: 'Login successful'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      message: 'An error occurred during login'
    })
  }
})
