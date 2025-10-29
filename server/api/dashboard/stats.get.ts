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

    // Get current month start date
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Get role IDs
    const studentRole = await prisma.role.findFirst({ where: { name: 'student' } })
    const teacherRole = await prisma.role.findFirst({ where: { name: 'teacher' } })

    // Total students
    const totalStudents = await prisma.user.count({
      where: {
        userRoles: {
          some: {
            roleId: studentRole?.id
          }
        }
      }
    })

    const lastMonthStudents = await prisma.user.count({
      where: {
        userRoles: {
          some: {
            roleId: studentRole?.id
          }
        },
        createdAt: {
          lt: currentMonthStart
        }
      }
    })

    const studentsChange = lastMonthStudents > 0
      ? ((totalStudents - lastMonthStudents) / lastMonthStudents) * 100
      : 0

    // Total teachers
    const totalTeachers = await prisma.user.count({
      where: {
        userRoles: {
          some: {
            roleId: teacherRole?.id
          }
        }
      }
    })

    const lastMonthTeachers = await prisma.user.count({
      where: {
        userRoles: {
          some: {
            roleId: teacherRole?.id
          }
        },
        createdAt: {
          lt: currentMonthStart
        }
      }
    })

    const teachersChange = lastMonthTeachers > 0
      ? ((totalTeachers - lastMonthTeachers) / lastMonthTeachers) * 100
      : 0

    // Total hafalan
    const totalHafalan = await prisma.hafalan.count()

    const lastMonthHafalan = await prisma.hafalan.count({
      where: {
        createdAt: {
          lt: currentMonthStart
        }
      }
    })

    const hafalanChange = lastMonthHafalan > 0
      ? ((totalHafalan - lastMonthHafalan) / lastMonthHafalan) * 100
      : 0

    // Average score
    const scoreResult = await prisma.hafalan.aggregate({
      _avg: {
        score: true
      }
    })

    const lastMonthScoreResult = await prisma.hafalan.aggregate({
      _avg: {
        score: true
      },
      where: {
        createdAt: {
          lt: currentMonthStart
        }
      }
    })

    const averageScore = scoreResult._avg.score || 0
    const lastMonthScore = lastMonthScoreResult._avg.score || 0

    const scoreChange = lastMonthScore > 0
      ? ((averageScore - lastMonthScore) / lastMonthScore) * 100
      : 0

    return {
      totalStudents,
      studentsChange: Math.round(studentsChange * 10) / 10,
      totalTeachers,
      teachersChange: Math.round(teachersChange * 10) / 10,
      totalHafalan,
      hafalanChange: Math.round(hafalanChange * 10) / 10,
      averageScore,
      scoreChange: Math.round(scoreChange * 10) / 10
    }
  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch dashboard stats'
    })
  }
})
