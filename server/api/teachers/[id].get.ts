import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Teacher ID is required'
      })
    }

    const teacher = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            teacherClasses: {
              include: {
                class: true
              }
            }
          }
        },
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!teacher) {
      throw createError({
        statusCode: 404,
        message: 'Teacher not found'
      })
    }

    return {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      nip: teacher.profile?.nip || '-',
      phone: teacher.profile?.phone || '-',
      gender: teacher.profile?.gender || '-',
      birthDate: teacher.profile?.birthDate || null,
      birthPlace: teacher.profile?.birthPlace || '-',
      address: teacher.profile?.address || '-',
      classes: teacher.profile?.teacherClasses.map(tc => ({
        id: tc.class.id,
        name: tc.class.name
      })) || [],
      isActive: teacher.isActive,
      createdAt: teacher.createdAt,
      roles: teacher.userRoles.map(ur => ur.role.name)
    }
  } catch (error: any) {
    console.error('Get teacher error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch teacher'
    })
  }
})
