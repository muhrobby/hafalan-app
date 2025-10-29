import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Data 114 Surah Al-Quran
const surahs = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", totalVerses: 7 }
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", totalVerses: 286 }
  { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", totalVerses: 200 }
  { number: 4, name: "An-Nisa", arabicName: "النساء", totalVerses: 176 }
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", totalVerses: 120 }
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", totalVerses: 165 }
  { number: 7, name: "Al-A'raf", arabicName: "الأعراف", totalVerses: 206 }
  { number: 8, name: "Al-Anfal", arabicName: "الأنفال", totalVerses: 75 }
  { number: 9, name: "At-Taubah", arabicName: "التوبة", totalVerses: 129 }
  { number: 10, name: "Yunus", arabicName: "يونس", totalVerses: 109 }
  { number: 11, name: "Hud", arabicName: "هود", totalVerses: 123 }
  { number: 12, name: "Yusuf", arabicName: "يوسف", totalVerses: 111 }
  { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", totalVerses: 43 }
  { number: 14, name: "Ibrahim", arabicName: "ابراهيم", totalVerses: 52 }
  { number: 15, name: "Al-Hijr", arabicName: "الحجر", totalVerses: 99 }
  { number: 16, name: "An-Nahl", arabicName: "النحل", totalVerses: 128 }
  { number: 17, name: "Al-Isra", arabicName: "الإسراء", totalVerses: 111 }
  { number: 18, name: "Al-Kahf", arabicName: "الكهف", totalVerses: 110 }
  { number: 19, name: "Maryam", arabicName: "مريم", totalVerses: 98 }
  { number: 20, name: "Taha", arabicName: "طه", totalVerses: 135 }
  { number: 21, name: "Al-Anbiya", arabicName: "الأنبياء", totalVerses: 112 }
  { number: 22, name: "Al-Hajj", arabicName: "الحج", totalVerses: 78 }
  { number: 23, name: "Al-Mu'minun", arabicName: "المؤمنون", totalVerses: 118 }
  { number: 24, name: "An-Nur", arabicName: "النور", totalVerses: 64 }
  { number: 25, name: "Al-Furqan", arabicName: "الفرقان", totalVerses: 77 }
  { number: 26, name: "Ash-Shu'ara", arabicName: "الشعراء", totalVerses: 227 }
  { number: 27, name: "An-Naml", arabicName: "النمل", totalVerses: 93 }
  { number: 28, name: "Al-Qasas", arabicName: "القصص", totalVerses: 88 }
  { number: 29, name: "Al-Ankabut", arabicName: "العنكبوت", totalVerses: 69 }
  { number: 30, name: "Ar-Rum", arabicName: "الروم", totalVerses: 60 }
  { number: 31, name: "Luqman", arabicName: "لقمان", totalVerses: 34 }
  { number: 32, name: "As-Sajdah", arabicName: "السجدة", totalVerses: 30 }
  { number: 33, name: "Al-Ahzab", arabicName: "الأحزاب", totalVerses: 73 }
  { number: 34, name: "Saba", arabicName: "سبإ", totalVerses: 54 }
  { number: 35, name: "Fatir", arabicName: "فاطر", totalVerses: 45 }
  { number: 36, name: "Ya-Sin", arabicName: "يس", totalVerses: 83 }
  { number: 37, name: "As-Saffat", arabicName: "الصافات", totalVerses: 182 }
  { number: 38, name: "Sad", arabicName: "ص", totalVerses: 88 }
  { number: 39, name: "Az-Zumar", arabicName: "الزمر", totalVerses: 75 }
  { number: 40, name: "Ghafir", arabicName: "غافر", totalVerses: 85 }
  { number: 41, name: "Fussilat", arabicName: "فصلت", totalVerses: 54 }
  { number: 42, name: "Ash-Shuraa", arabicName: "الشورى", totalVerses: 53 }
  { number: 43, name: "Az-Zukhruf", arabicName: "الزخرف", totalVerses: 89 }
  { number: 44, name: "Ad-Dukhan", arabicName: "الدخان", totalVerses: 59 }
  { number: 45, name: "Al-Jathiyah", arabicName: "الجاثية", totalVerses: 37 }
  { number: 46, name: "Al-Ahqaf", arabicName: "الأحقاف", totalVerses: 35 }
  { number: 47, name: "Muhammad", arabicName: "محمد", totalVerses: 38 }
  { number: 48, name: "Al-Fath", arabicName: "الفتح", totalVerses: 29 }
  { number: 49, name: "Al-Hujurat", arabicName: "الحجرات", totalVerses: 18 }
  { number: 50, name: "Qaf", arabicName: "ق", totalVerses: 45 }
  { number: 51, name: "Adh-Dhariyat", arabicName: "الذاريات", totalVerses: 60 }
  { number: 52, name: "At-Tur", arabicName: "الطور", totalVerses: 49 }
  { number: 53, name: "An-Najm", arabicName: "النجم", totalVerses: 62 }
  { number: 54, name: "Al-Qamar", arabicName: "القمر", totalVerses: 55 }
  { number: 55, name: "Ar-Rahman", arabicName: "الرحمن", totalVerses: 78 }
  { number: 56, name: "Al-Waqi'ah", arabicName: "الواقعة", totalVerses: 96 }
  { number: 57, name: "Al-Hadid", arabicName: "الحديد", totalVerses: 29 }
  { number: 58, name: "Al-Mujadila", arabicName: "المجادلة", totalVerses: 22 }
  { number: 59, name: "Al-Hashr", arabicName: "الحشر", totalVerses: 24 }
  { number: 60, name: "Al-Mumtahanah", arabicName: "الممتحنة", totalVerses: 13 }
  { number: 61, name: "As-Saf", arabicName: "الصف", totalVerses: 14 }
  { number: 62, name: "Al-Jumu'ah", arabicName: "الجمعة", totalVerses: 11 }
  { number: 63, name: "Al-Munafiqun", arabicName: "المنافقون", totalVerses: 11 }
  { number: 64, name: "At-Taghabun", arabicName: "التغابن", totalVerses: 18 }
  { number: 65, name: "At-Talaq", arabicName: "الطلاق", totalVerses: 12 }
  { number: 66, name: "At-Tahrim", arabicName: "التحريم", totalVerses: 12 }
  { number: 67, name: "Al-Mulk", arabicName: "الملك", totalVerses: 30 }
  { number: 68, name: "Al-Qalam", arabicName: "القلم", totalVerses: 52 }
  { number: 69, name: "Al-Haqqah", arabicName: "الحاقة", totalVerses: 52 }
  { number: 70, name: "Al-Ma'arij", arabicName: "المعارج", totalVerses: 44 }
  { number: 71, name: "Nuh", arabicName: "نوح", totalVerses: 28 }
  { number: 72, name: "Al-Jinn", arabicName: "الجن", totalVerses: 28 }
  { number: 73, name: "Al-Muzzammil", arabicName: "المزمل", totalVerses: 20 }
  { number: 74, name: "Al-Muddaththir", arabicName: "المدثر", totalVerses: 56 }
  { number: 75, name: "Al-Qiyamah", arabicName: "القيامة", totalVerses: 40 }
  { number: 76, name: "Al-Insan", arabicName: "الانسان", totalVerses: 31 }
  { number: 77, name: "Al-Mursalat", arabicName: "المرسلات", totalVerses: 50 }
  { number: 78, name: "An-Naba", arabicName: "النبإ", totalVerses: 40 }
  { number: 79, name: "An-Nazi'at", arabicName: "النازعات", totalVerses: 46 }
  { number: 80, name: "Abasa", arabicName: "عبس", totalVerses: 42 }
  { number: 81, name: "At-Takwir", arabicName: "التكوير", totalVerses: 29 }
  { number: 82, name: "Al-Infitar", arabicName: "الإنفطار", totalVerses: 19 }
  { number: 83, name: "Al-Mutaffifin", arabicName: "المطففين", totalVerses: 36 }
  { number: 84, name: "Al-Inshiqaq", arabicName: "الإنشقاق", totalVerses: 25 }
  { number: 85, name: "Al-Buruj", arabicName: "البروج", totalVerses: 22 }
  { number: 86, name: "At-Tariq", arabicName: "الطارق", totalVerses: 17 }
  { number: 87, name: "Al-A'la", arabicName: "الأعلى", totalVerses: 19 }
  { number: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", totalVerses: 26 }
  { number: 89, name: "Al-Fajr", arabicName: "الفجر", totalVerses: 30 }
  { number: 90, name: "Al-Balad", arabicName: "البلد", totalVerses: 20 }
  { number: 91, name: "Ash-Shams", arabicName: "الشمس", totalVerses: 15 }
  { number: 92, name: "Al-Lail", arabicName: "الليل", totalVerses: 21 }
  { number: 93, name: "Ad-Duha", arabicName: "الضحى", totalVerses: 11 }
  { number: 94, name: "Ash-Sharh", arabicName: "الشرح", totalVerses: 8 }
  { number: 95, name: "At-Tin", arabicName: "التين", totalVerses: 8 }
  { number: 96, name: "Al-Alaq", arabicName: "العلق", totalVerses: 19 }
  { number: 97, name: "Al-Qadr", arabicName: "القدر", totalVerses: 5 }
  { number: 98, name: "Al-Bayyinah", arabicName: "البينة", totalVerses: 8 }
  { number: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", totalVerses: 8 }
  { number: 100, name: "Al-Adiyat", arabicName: "العاديات", totalVerses: 11 }
  { number: 101, name: "Al-Qari'ah", arabicName: "القارعة", totalVerses: 11 }
  { number: 102, name: "At-Takathur", arabicName: "التكاثر", totalVerses: 8 }
  { number: 103, name: "Al-Asr", arabicName: "العصر", totalVerses: 3 }
  { number: 104, name: "Al-Humazah", arabicName: "الهمزة", totalVerses: 9 }
  { number: 105, name: "Al-Fil", arabicName: "الفيل", totalVerses: 5 }
  { number: 106, name: "Quraish", arabicName: "قريش", totalVerses: 4 }
  { number: 107, name: "Al-Ma'un", arabicName: "الماعون", totalVerses: 7 }
  { number: 108, name: "Al-Kauthar", arabicName: "الكوثر", totalVerses: 3 }
  { number: 109, name: "Al-Kafirun", arabicName: "الكافرون", totalVerses: 6 }
  { number: 110, name: "An-Nasr", arabicName: "النصر", totalVerses: 3 }
  { number: 111, name: "Al-Masad", arabicName: "المسد", totalVerses: 5 }
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", totalVerses: 4 }
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", totalVerses: 5 }
  { number: 114, name: "An-Nas", arabicName: "الناس", totalVerses: 6 }
]

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create Roles
  console.log('📝 Creating roles...')
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' }
    update: {}
    create: {
      name: 'admin'
      guardName: 'web'
    }
  })

  const teacherRole = await prisma.role.upsert({
    where: { name: 'teacher' }
    update: {}
    create: {
      name: 'teacher'
      guardName: 'web'
    }
  })

  const guardianRole = await prisma.role.upsert({
    where: { name: 'wali' }
    update: {}
    create: {
      name: 'wali'
      guardName: 'web'
    }
  })

  const studentRole = await prisma.role.upsert({
    where: { name: 'student' }
    update: {}
    create: {
      name: 'student'
      guardName: 'web'
    }
  })

  console.log('✅ Roles created!')

  // Create Permissions
  console.log('📝 Creating permissions...')
  const permissions = [
    'view-users', 'create-users', 'edit-users', 'delete-users'
    'view-students', 'create-students', 'edit-students', 'delete-students'
    'view-teachers', 'create-teachers', 'edit-teachers', 'delete-teachers'
    'view-guardians', 'create-guardians', 'edit-guardians', 'delete-guardians'
    'view-hafalan', 'create-hafalan', 'edit-hafalan', 'delete-hafalan'
    'view-analytics', 'export-data', 'import-data'
  ]

  for (const permName of permissions) {
    await prisma.permission.upsert({
      where: { name: permName }
      update: {}
      create: {
        name: permName
        guardName: 'web'
      }
    })
  }

  console.log('✅ Permissions created!')

  // Assign all permissions to admin role
  console.log('📝 Assigning permissions to admin role...')
  const allPermissions = await prisma.permission.findMany()
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id
          permissionId: permission.id
        }
      }
      update: {}
      create: {
        roleId: adminRole.id
        permissionId: permission.id
      }
    })
  }

  console.log('✅ Permissions assigned!')

  // Create Admin User
  console.log('📝 Creating admin user...')
  const hashedPassword = await bcrypt.hash('password', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' }
    update: {}
    create: {
      name: 'Administrator'
      email: 'admin@example.com'
      password: hashedPassword
      emailVerifiedAt: new Date()
      mustChangePassword: false
    }
  })

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id
        roleId: adminRole.id
      }
    }
    update: {}
    create: {
      userId: adminUser.id
      roleId: adminRole.id
    }
  })

  // Create profile for admin
  await prisma.profile.upsert({
    where: { userId: adminUser.id }
    update: {}
    create: {
      userId: adminUser.id
      phone: '08123456789'
    }
  })

  console.log('✅ Admin user created!')

  // Seed Surahs
  console.log('📝 Seeding 114 Surahs...')
  for (const surah of surahs) {
    await prisma.surah.upsert({
      where: { number: surah.number }
      update: {}
      create: surah
    })
  }

  console.log('✅ All 114 Surahs seeded!')

  // Create sample classes
  // Seed sample classes
  console.log('📝 Creating sample classes...')
  await prisma.classe.deleteMany({})
  await prisma.classe.createMany({
    data: [
      { name: 'Kelas A' }
      { name: 'Kelas B' }
      { name: 'Kelas C' }
    ]
  })
  console.log('✅ Sample classes created!')

  console.log('')
  console.log('🎉 Database seeding completed successfully!')
  console.log('')
  console.log('📋 Summary:')
  console.log(`  - Roles: 4 (admin, teacher, wali, student)`)
  console.log(`  - Permissions: ${permissions.length}`)
  console.log(`  - Users: 1 (admin@example.com)`)
  console.log(`  - Surahs: 114`)
  console.log(`  - Classes: ${classes.length}`)
  console.log('')
  console.log('🔐 Default Login:')
  console.log('  Email: admin@example.com')
  console.log('  Password: password')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
