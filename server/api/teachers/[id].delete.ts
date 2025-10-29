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

    const id = parseInt(event.context.params?.id as string)
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Invalid teacher ID'
      })
    }

    // Fetch teacher to ensure existence
    const teacher = await prisma.user.findUnique({
      where: { id }
    })

    if (!teacher) {
      throw createError({
        statusCode: 404,
        message: 'Teacher not found'
      })
    }

    // Delete teacher (soft delete via deactivation)
    const deletedTeacher = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        profile: {
          update: {
            nip: null
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'delete',
        model: 'Teacher',
        modelId: id,
        oldValues: JSON.stringify({
          name: teacher.name,
          email: teacher.email,
          isActive: teacher.isActive
        })
      }
    }).catch(() => {
      // Ignore audit log errors
    })

    return {
      message: 'Teacher deleted successfully',
      deletedTeacherId: id
    }
  } catch (error: any) {
    console.error('Delete teacher error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete teacher'
    })
  }
})
