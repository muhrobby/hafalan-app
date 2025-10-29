import prisma from '../../utils/prisma'
import { subDays, format, eachDayOfInterval } from 'date-fns'
import { id } from 'date-fns/locale'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // Get last 30 days
    const endDate = new Date()
    const startDate = subDays(endDate, 29)

    // Generate all dates in range
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

    // Get hafalan count per day for last 30 days
    const hafalanData = await prisma.hafalan.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Map data to dates
    const hafalanByDate = new Map()
    hafalanData.forEach(item => {
      const date = format(new Date(item.createdAt), 'yyyy-MM-dd')
      hafalanByDate.set(date, (hafalanByDate.get(date) || 0) + item._count)
    })

    const hafalanProgress = {
      labels: dateRange.map(date => format(date, 'd MMM', { locale: id })),
      data: dateRange.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd')
        return hafalanByDate.get(dateKey) || 0
      })
    }

    // Get class performance (average score per class)
    const classes = await prisma.classe.findMany({
      select: {
        id: true,
        name: true
      }
    })

    const classPerformanceData = await Promise.all(
      classes.map(async (classe) => {
        const result = await prisma.hafalan.aggregate({
          _avg: {
            score: true
          },
          where: {
            student: {
              studentClasses: {
                some: {
                  classId: classe.id
                }
              }
            }
          }
        })

        return {
          className: classe.name,
          avgScore: result._avg.score || 0
        }
      })
    )

    const classPerformance = {
      labels: classPerformanceData.map(d => d.className),
      data: classPerformanceData.map(d => Math.round(d.avgScore * 10) / 10)
    }

    return {
      hafalanProgress,
      classPerformance
    }
  } catch (error: any) {
    console.error('Dashboard chart data error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch chart data'
    })
  }
})
