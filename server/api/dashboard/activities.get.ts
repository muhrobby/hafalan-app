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

    // Get recent audit logs
    const activities = await prisma.auditLog.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return activities.map(activity => ({
      id: activity.id,
      type: activity.action,
      description: formatActivityDescription(activity),
      createdAt: activity.createdAt,
      user: {
        name: activity.user?.name || activity.user?.email || 'Unknown',
        email: activity.user?.email
      }
    }))
  } catch (error: any) {
    console.error('Dashboard activities error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch activities'
    })
  }
})

function formatActivityDescription(activity: any): string {
  const userName = activity.user?.name || activity.user?.email || 'User'
  const modelName = activity.model.toLowerCase()

  switch (activity.action) {
    case 'create':
      return `${userName} membuat ${getModelLabel(modelName)} baru`
    case 'update':
      return `${userName} mengubah ${getModelLabel(modelName)}`
    case 'delete':
      return `${userName} menghapus ${getModelLabel(modelName)}`
    default:
      return `${userName} melakukan ${activity.action} pada ${getModelLabel(modelName)}`
  }
}

function getModelLabel(model: string): string {
  const labels: Record<string, string> = {
    profile: 'profil',
    student: 'siswa',
    teacher: 'guru',
    guardian: 'wali murid',
    classe: 'kelas',
    hafalan: 'hafalan',
    user: 'user'
  }
  return labels[model] || model
}
