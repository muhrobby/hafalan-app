import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface JwtPayload {
  userId: number
  email: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
  profile?: any
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JwtPayload): string {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret
  
  return jwt.sign(payload, secret, {
    expiresIn: '7d' // 7 days
  })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const config = useRuntimeConfig()
    const secret = config.jwtSecret
    
    const decoded = jwt.verify(token, secret) as JwtPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Get user from token with roles and permissions
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const payload = verifyToken(token)
  
  if (!payload) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      profile: true,
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
      }
    }
  })

  if (!user) {
    return null
  }

  // Extract roles and permissions
  const roles = user.roles.map(ur => ur.role.name)
  const permissions = user.roles.flatMap(ur => 
    ur.role.permissions.map(rp => rp.permission.name)
  )

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles,
    permissions: [...new Set(permissions)], // Remove duplicates
    profile: user.profile
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: AuthUser | null, role: string): boolean {
  if (!user) return false
  return user.roles.includes(role)
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser | null, roles: string[]): boolean {
  if (!user) return false
  return roles.some(role => user.roles.includes(role))
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false
  return user.permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: AuthUser | null, permissions: string[]): boolean {
  if (!user) return false
  return permissions.some(perm => user.permissions.includes(perm))
}
