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
    const body = await readBody(event)

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

    // Check if email is being changed and if it already exists
    if (body.email && body.email !== existingStudent.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email }
      })

      if (emailExists) {
        throw createError({
          statusCode: 400,
          message: 'Email already exists'
        })
      }
    }

    // Check if NIS is being changed and if it already exists
    if (body.nis && body.nis !== existingStudent.profile?.nis) {
      const nisExists = await prisma.profile.findUnique({
        where: { nis: body.nis }
      })

      if (nisExists) {
        throw createError({
          statusCode: 400,
          message: 'NIS already exists'
        })
      }
    }

    // Update user
    const student = await prisma.user.update({
      where: { id },
      data: {
        name: body.name || existingStudent.name,
        email: body.email || existingStudent.email,
        isActive: body.isActive !== undefined ? body.isActive : existingStudent.isActive,
        profile: {
          update: {
            nis: body.nis || existingStudent.profile?.nis,
            phone: body.phone !== undefined ? body.phone : existingStudent.profile?.phone,
            address: body.address !== undefined ? body.address : existingStudent.profile?.address,
            birthDate: body.birthDate ? new Date(body.birthDate) : existingStudent.profile?.birthDate,
            birthPlace: body.birthPlace !== undefined ? body.birthPlace : existingStudent.profile?.birthPlace,
            gender: body.gender !== undefined ? body.gender : existingStudent.profile?.gender
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Update classes if provided
    if (body.classIds !== undefined && existingStudent.profile) {
      // Delete existing class assignments
      await prisma.studentClass.deleteMany({
        where: { profileId: existingStudent.profile.id }
      })

      // Create new class assignments
      if (body.classIds.length > 0) {
        await prisma.studentClass.createMany({
          data: body.classIds.map((classId: number) => ({
            profileId: existingStudent.profile!.id,
            classId
          }))
        })
      }
    }

    // Log activity
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'update',
        model: 'Student',
        modelId: student.id,
        oldValues: JSON.stringify(existingStudent),
        newValues: JSON.stringify(student)
      }
    })

    return {
      success: true,
      data: student
    }
  } catch (error: any) {
    console.error('Update student error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update student'
    })
  }
})
