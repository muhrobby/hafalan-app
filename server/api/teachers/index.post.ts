import prisma from '../../utils/prisma'
import { hashPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const body = await readBody(event)
    const { name, email, phone, gender, birthDate, birthPlace, address, classIds } = body

    // Validate required fields
    if (!name || !email) {
      throw createError({
        statusCode: 400,
        message: 'Name and email are required'
      })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'Email already exists'
      })
    }

    // Get teacher role
    const teacherRole = await prisma.role.findFirst({
      where: { name: 'teacher' }
    })

    if (!teacherRole) {
      throw createError({
        statusCode: 500,
        message: 'Teacher role not found'
      })
    }

    // Generate NIP (format: YYYY0001)
    const currentYear = new Date().getFullYear()
    const lastTeacher = await prisma.user.findFirst({
      where: {
        userRoles: {
          some: { roleId: teacherRole.id }
        }
      },
      include: {
        profile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    let nipNumber = 1
    if (lastTeacher?.profile?.nip) {
      const lastNip = lastTeacher.profile.nip
      const lastNumber = parseInt(lastNip.substring(4))
      if (!isNaN(lastNumber)) {
        nipNumber = lastNumber + 1
      }
    }

    const nip = `${currentYear}${String(nipNumber).padStart(4, '0')}`
    const defaultPassword = 'teacher123'

    // Create teacher user
    const newTeacher = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(defaultPassword),
        isActive: true,
        userRoles: {
          create: {
            roleId: teacherRole.id
          }
        },
        profile: {
          create: {
            nip,
            phone,
            gender,
            birthDate: birthDate ? new Date(birthDate) : null,
            birthPlace,
            address
          }
        }
      },
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

    // Assign classes if provided
    if (classIds && Array.isArray(classIds) && classIds.length > 0) {
      for (const classId of classIds) {
        await prisma.teacherClass.create({
          data: {
            profileId: newTeacher.profile!.id,
            classId
          }
        }).catch(() => {
          // Ignore if class-teacher relationship already exists
        })
      }

      // Fetch updated teacher with classes
      const updatedTeacher = await prisma.user.findUnique({
        where: { id: newTeacher.id },
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
        id: updatedTeacher!.id,
        name: updatedTeacher!.name,
        email: updatedTeacher!.email,
        nip: updatedTeacher!.profile?.nip,
        phone: updatedTeacher!.profile?.phone,
        gender: updatedTeacher!.profile?.gender,
        birthDate: updatedTeacher!.profile?.birthDate,
        birthPlace: updatedTeacher!.profile?.birthPlace,
        address: updatedTeacher!.profile?.address,
        classes: updatedTeacher!.profile?.teacherClasses.map(tc => tc.class.name) || [],
        message: `Teacher created successfully with NIP: ${nip}. Default password: ${defaultPassword}`
      }
    }

    return {
      id: newTeacher.id,
      name: newTeacher.name,
      email: newTeacher.email,
      nip: newTeacher.profile?.nip,
      phone: newTeacher.profile?.phone,
      gender: newTeacher.profile?.gender,
      birthDate: newTeacher.profile?.birthDate,
      birthPlace: newTeacher.profile?.birthPlace,
      address: newTeacher.profile?.address,
      classes: [],
      message: `Teacher created successfully with NIP: ${nip}. Default password: ${defaultPassword}`
    }
  } catch (error: any) {
    console.error('Create teacher error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create teacher'
    })
  }
})
