import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const classes = await prisma.classe.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return classes
  } catch (error: any) {
    console.error('Get classes error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch classes'
    })
  }
})
