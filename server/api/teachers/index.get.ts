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

    // Get teacher role
    const teacherRole = await prisma.role.findFirst({
      where: { name: 'teacher' }
    })

    if (!teacherRole) {
      throw createError({
        statusCode: 500,
        message: 'Teacher role not found'
      })
    }

    // Build where clause
    const where: any = {
      userRoles: {
        some: {
          roleId: teacherRole.id
        }
      }
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { nip: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get total count
    const total = await prisma.user.count({ where })

    // Get teachers with pagination
    const teachers = await prisma.user.findMany({
      where,
      include: {
        profile: {
          include: {
            teacherClasses: {
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
    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      nip: teacher.profile?.nip || '-',
      phone: teacher.profile?.phone || '-',
      gender: teacher.profile?.gender || '-',
      birthDate: teacher.profile?.birthDate || null,
      birthPlace: teacher.profile?.birthPlace || '-',
      address: teacher.profile?.address || '-',
      classes: teacher.profile?.teacherClasses.map(tc => tc.class.name) || [],
      isActive: teacher.isActive,
      createdAt: teacher.createdAt
    }))

    return {
      data: formattedTeachers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Get teachers error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch teachers'
    })
  }
})
