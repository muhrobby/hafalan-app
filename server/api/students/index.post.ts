import prisma from '../../utils/prisma'
import { hashPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const body = await readBody(event)

    // Validate required fields
    if (!body.name || !body.email) {
      throw createError({
        statusCode: 400,
        message: 'Name and email are required'
      })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'Email already exists'
      })
    }

    // Get student role
    const studentRole = await prisma.role.findFirst({
      where: { name: 'student' }
    })

    if (!studentRole) {
      throw createError({
        statusCode: 500,
        message: 'Student role not found'
      })
    }

    // Generate NIS if not provided
    let nis = body.nis
    if (!nis) {
      const year = new Date().getFullYear()
      const count = await prisma.profile.count({
        where: { nis: { startsWith: `${year}` } }
      })
      nis = `${year}${String(count + 1).padStart(4, '0')}`
    }

    // Check if NIS already exists
    const existingNis = await prisma.profile.findUnique({
      where: { nis }
    })

    if (existingNis) {
      throw createError({
        statusCode: 400,
        message: 'NIS already exists'
      })
    }

    // Default password
    const defaultPassword = body.password || 'student123'
    const hashedPassword = await hashPassword(defaultPassword)

    // Create user with profile
    const student = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        mustChangePassword: true,
        userRoles: {
          create: {
            roleId: studentRole.id
          }
        },
        profile: {
          create: {
            nis,
            phone: body.phone || null,
            address: body.address || null,
            birthDate: body.birthDate ? new Date(body.birthDate) : null,
            birthPlace: body.birthPlace || null,
            gender: body.gender || null
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Add to classes if provided
    if (body.classIds && body.classIds.length > 0) {
      await prisma.studentClass.createMany({
        data: body.classIds.map((classId: number) => ({
          profileId: student.profile!.id,
          classId
        }))
      })
    }

    // Log activity
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'create',
        model: 'Student',
        modelId: student.id,
        newValues: JSON.stringify(student)
      }
    })

    return {
      success: true,
      data: student
    }
  } catch (error: any) {
    console.error('Create student error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create student'
    })
  }
})
