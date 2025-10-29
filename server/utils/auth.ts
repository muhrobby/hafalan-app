import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { User, Role } from '@prisma/client'

const SALT_ROUNDS = 10

export interface JWTPayload {
  userId: number
  email: string
  roles: string[]
}

export interface UserWithRoles extends User {
  userRoles?: {
    role: Role
  }[]
}

/**
 * Hash password menggunakan bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify password dengan hash yang tersimpan
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  const config = useRuntimeConfig()
  
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })
}

/**
 * Verify dan decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtSecret) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Extract JWT token dari Authorization header
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Sanitize user data (remove password)
 */
export function sanitizeUser(user: UserWithRoles) {
  const { password, twoFactorSecret, ...sanitized } = user
  
  return {
    ...sanitized,
    roles: user.userRoles?.map(ur => ur.role.name) || [],
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(user: UserWithRoles, roleName: string): boolean {
  return user.userRoles?.some(ur => ur.role.name === roleName) || false
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserWithRoles, roleNames: string[]): boolean {
  return roleNames.some(roleName => hasRole(user, roleName))
}

/**
 * Extract user dari event request (setelah auth middleware)
 */
export function getUserFromEvent(event: any): UserWithRoles | null {
  return event.context.user || null
}
