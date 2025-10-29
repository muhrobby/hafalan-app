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

    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            studentClasses: {
              include: {
                class: true
              }
            },
            studentGuardians: {
              include: {
                guardian: {
                  include: {
                    user: true
                  }
                }
              }
            },
            hafalans: {
              include: {
                surah: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
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

    if (!student) {
      throw createError({
        statusCode: 404,
        message: 'Student not found'
      })
    }

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      nis: student.profile?.nis || '-',
      phone: student.profile?.phone || '-',
      gender: student.profile?.gender || '-',
      birthDate: student.profile?.birthDate || null,
      birthPlace: student.profile?.birthPlace || '-',
      address: student.profile?.address || '-',
      classes: student.profile?.studentClasses.map(sc => ({
        id: sc.class.id,
        name: sc.class.name
      })) || [],
      guardians: student.profile?.studentGuardians.map(sg => ({
        id: sg.guardian.userId,
        name: sg.guardian.user.name,
        email: sg.guardian.user.email,
        phone: sg.guardian.phone,
        relationship: sg.relationship
      })) || [],
      hafalans: student.profile?.hafalans.map(h => ({
        id: h.id,
        surah: h.surah.name,
        verseStart: h.verseStart,
        verseEnd: h.verseEnd,
        score: h.score,
        createdAt: h.createdAt
      })) || [],
      isActive: student.isActive,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    }
  } catch (error: any) {
    console.error('Get student error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch student'
    })
  }
})
