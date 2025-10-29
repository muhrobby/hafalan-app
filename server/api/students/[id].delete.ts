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

    const id = parseInt(event.context.params?.id || '0')

    // Get existing student
    const existingStudent = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    })

    if (!existingStudent) {
      throw createError({
        statusCode: 404,
        message: 'Student not found'
      })
    }

    // Delete student (cascade will handle profile and relations)
    await prisma.user.delete({
      where: { id }
    })

    // Log activity
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'delete',
        model: 'Student',
        modelId: id,
        oldValues: JSON.stringify(existingStudent)
      }
    })

    return {
      success: true,
      message: 'Student deleted successfully'
    }
  } catch (error: any) {
    console.error('Delete student error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete student'
    })
  }
})
