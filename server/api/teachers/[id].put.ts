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

    const body = await readBody(event)
    const { name, email, phone, gender, birthDate, birthPlace, address, classIds } = body

    // Fetch current teacher
    const currentTeacher = await prisma.user.findUnique({
      where: { id }
    })

    if (!currentTeacher) {
      throw createError({
        statusCode: 404,
        message: 'Teacher not found'
      })
    }

    // Check if email is taken by another user
    if (email && email !== currentTeacher.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        throw createError({
          statusCode: 400,
          message: 'Email already in use'
        })
      }
    }

    // Update user and profile
    const updatedTeacher = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        profile: {
          update: {
            phone,
            gender,
            birthDate: birthDate ? new Date(birthDate) : null,
            birthPlace,
            address
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Handle class assignments
    if (classIds && Array.isArray(classIds)) {
      const profileId = updatedTeacher.profile!.id

      // Delete existing class assignments
      await prisma.teacherClass.deleteMany({
        where: {
          teacherId: profileId
        }
      })

      // Create new class assignments
      if (classIds.length > 0) {
        for (const classId of classIds) {
          await prisma.teacherClass.create({
            data: {
              teacherId: profileId,
              classId
            }
          }).catch(() => {
            // Ignore duplicates
          })
        }
      }
    }

    // Fetch final teacher with classes
    const finalTeacher = await prisma.user.findUnique({
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
        }
      }
    })

    return {
      id: finalTeacher!.id,
      name: finalTeacher!.name,
      email: finalTeacher!.email,
      nip: finalTeacher!.profile?.nip || '-',
      phone: finalTeacher!.profile?.phone || '-',
      gender: finalTeacher!.profile?.gender || '-',
      birthDate: finalTeacher!.profile?.birthDate || null,
      birthPlace: finalTeacher!.profile?.birthPlace || '-',
      address: finalTeacher!.profile?.address || '-',
      classes: finalTeacher!.profile?.teacherClasses.map((tc: any) => tc.class.name) || [],
      message: 'Teacher updated successfully'
    }
  } catch (error: any) {
    console.error('Update teacher error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update teacher'
    })
  }
})
