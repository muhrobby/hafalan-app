import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''

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

    // Build where clause
    const where: any = {
      userRoles: {
        some: {
          roleId: studentRole.id
        }
      }
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { nis: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get total count
    const total = await prisma.user.count({ where })

    // Get students with pagination
    const students = await prisma.user.findMany({
      where,
      include: {
        profile: {
          include: {
            studentClasses: {
              include: {
                class: true
              }
            }
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format response
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      nis: student.profile?.nis || '-',
      phone: student.profile?.phone || '-',
      gender: student.profile?.gender || '-',
      birthDate: student.profile?.birthDate || null,
      birthPlace: student.profile?.birthPlace || '-',
      address: student.profile?.address || '-',
      classes: student.profile?.studentClasses.map(sc => sc.class.name) || [],
      isActive: student.isActive,
      createdAt: student.createdAt
    }))

    return {
      data: formattedStudents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Get students error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch students'
    })
  }
})
