import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// List of 114 Surahs
const surahs = [
  { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', verseCount: 7 },
  { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', verseCount: 286 },
  { number: 3, name: 'Ali \'Imran', arabicName: 'آل عمران', verseCount: 200 },
  { number: 4, name: 'An-Nisa', arabicName: 'النساء', verseCount: 176 },
  { number: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة', verseCount: 120 },
  { number: 6, name: 'Al-An\'am', arabicName: 'الأنعام', verseCount: 165 },
  { number: 7, name: 'Al-A\'raf', arabicName: 'الأعراف', verseCount: 206 },
  { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', verseCount: 75 },
  { number: 9, name: 'At-Tawbah', arabicName: 'التوبة', verseCount: 129 },
  { number: 10, name: 'Yunus', arabicName: 'يونس', verseCount: 109 },
  { number: 11, name: 'Hud', arabicName: 'هود', verseCount: 123 },
  { number: 12, name: 'Yusuf', arabicName: 'يوسف', verseCount: 111 },
  { number: 13, name: 'Ar-Ra\'d', arabicName: 'الرعد', verseCount: 43 },
  { number: 14, name: 'Ibrahim', arabicName: 'ابراهيم', verseCount: 52 },
  { number: 15, name: 'Al-Hijr', arabicName: 'الحجر', verseCount: 99 },
  { number: 16, name: 'An-Nahl', arabicName: 'النحل', verseCount: 128 },
  { number: 17, name: 'Al-Isra', arabicName: 'الإسراء', verseCount: 111 },
  { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', verseCount: 110 },
  { number: 19, name: 'Maryam', arabicName: 'مريم', verseCount: 98 },
  { number: 20, name: 'Taha', arabicName: 'طه', verseCount: 135 },
  { number: 21, name: 'Al-Anbya', arabicName: 'الأنبياء', verseCount: 112 },
  { number: 22, name: 'Al-Hajj', arabicName: 'الحج', verseCount: 78 },
  { number: 23, name: 'Al-Mu\'minun', arabicName: 'المؤمنون', verseCount: 118 },
  { number: 24, name: 'An-Nur', arabicName: 'النور', verseCount: 64 },
  { number: 25, name: 'Al-Furqan', arabicName: 'الفرقان', verseCount: 77 },
  { number: 26, name: 'Ash-Shu\'ara', arabicName: 'الشعراء', verseCount: 227 },
  { number: 27, name: 'An-Naml', arabicName: 'النمل', verseCount: 93 },
  { number: 28, name: 'Al-Qasas', arabicName: 'القصص', verseCount: 88 },
  { number: 29, name: 'Al-\'Ankabut', arabicName: 'العنكبوت', verseCount: 69 },
  { number: 30, name: 'Ar-Rum', arabicName: 'الروم', verseCount: 60 },
  { number: 31, name: 'Luqman', arabicName: 'لقمان', verseCount: 34 },
  { number: 32, name: 'As-Sajdah', arabicName: 'السجدة', verseCount: 30 },
  { number: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب', verseCount: 73 },
  { number: 34, name: 'Saba', arabicName: 'سبإ', verseCount: 54 },
  { number: 35, name: 'Fatir', arabicName: 'فاطر', verseCount: 45 },
  { number: 36, name: 'Ya-Sin', arabicName: 'يس', verseCount: 83 },
  { number: 37, name: 'As-Saffat', arabicName: 'الصافات', verseCount: 182 },
  { number: 38, name: 'Sad', arabicName: 'ص', verseCount: 88 },
  { number: 39, name: 'Az-Zumar', arabicName: 'الزمر', verseCount: 75 },
  { number: 40, name: 'Ghafir', arabicName: 'غافر', verseCount: 85 },
  { number: 41, name: 'Fussilat', arabicName: 'فصلت', verseCount: 54 },
  { number: 42, name: 'Ash-Shuraa', arabicName: 'الشورى', verseCount: 53 },
  { number: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف', verseCount: 89 },
  { number: 44, name: 'Ad-Dukhan', arabicName: 'الدخان', verseCount: 59 },
  { number: 45, name: 'Al-Jathiyah', arabicName: 'الجاثية', verseCount: 37 },
  { number: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف', verseCount: 35 },
  { number: 47, name: 'Muhammad', arabicName: 'محمد', verseCount: 38 },
  { number: 48, name: 'Al-Fath', arabicName: 'الفتح', verseCount: 29 },
  { number: 49, name: 'Al-Hujurat', arabicName: 'الحجرات', verseCount: 18 },
  { number: 50, name: 'Qaf', arabicName: 'ق', verseCount: 45 },
  { number: 51, name: 'Adh-Dhariyat', arabicName: 'الذاريات', verseCount: 60 },
  { number: 52, name: 'At-Tur', arabicName: 'الطور', verseCount: 49 },
  { number: 53, name: 'An-Najm', arabicName: 'النجم', verseCount: 62 },
  { number: 54, name: 'Al-Qamar', arabicName: 'القمر', verseCount: 55 },
  { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', verseCount: 78 },
  { number: 56, name: 'Al-Waqi\'ah', arabicName: 'الواقعة', verseCount: 96 },
  { number: 57, name: 'Al-Hadid', arabicName: 'الحديد', verseCount: 29 },
  { number: 58, name: 'Al-Mujadila', arabicName: 'المجادلة', verseCount: 22 },
  { number: 59, name: 'Al-Hashr', arabicName: 'الحشر', verseCount: 24 },
  { number: 60, name: 'Al-Mumtahanah', arabicName: 'الممتحنة', verseCount: 13 },
  { number: 61, name: 'As-Saf', arabicName: 'الصف', verseCount: 14 },
  { number: 62, name: 'Al-Jumu\'ah', arabicName: 'الجمعة', verseCount: 11 },
  { number: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون', verseCount: 11 },
  { number: 64, name: 'At-Taghabun', arabicName: 'التغابن', verseCount: 18 },
  { number: 65, name: 'At-Talaq', arabicName: 'الطلاق', verseCount: 12 },
  { number: 66, name: 'At-Tahrim', arabicName: 'التحريم', verseCount: 12 },
  { number: 67, name: 'Al-Mulk', arabicName: 'الملك', verseCount: 30 },
  { number: 68, name: 'Al-Qalam', arabicName: 'القلم', verseCount: 52 },
  { number: 69, name: 'Al-Haqqah', arabicName: 'الحاقة', verseCount: 52 },
  { number: 70, name: 'Al-Ma\'arij', arabicName: 'المعارج', verseCount: 44 },
  { number: 71, name: 'Nuh', arabicName: 'نوح', verseCount: 28 },
  { number: 72, name: 'Al-Jinn', arabicName: 'الجن', verseCount: 28 },
  { number: 73, name: 'Al-Muzzammil', arabicName: 'المزمل', verseCount: 20 },
  { number: 74, name: 'Al-Muddaththir', arabicName: 'المدثر', verseCount: 56 },
  { number: 75, name: 'Al-Qiyamah', arabicName: 'القيامة', verseCount: 40 },
  { number: 76, name: 'Al-Insan', arabicName: 'الانسان', verseCount: 31 },
  { number: 77, name: 'Al-Mursalat', arabicName: 'المرسلات', verseCount: 50 },
  { number: 78, name: 'An-Naba', arabicName: 'النبإ', verseCount: 40 },
  { number: 79, name: 'An-Nazi\'at', arabicName: 'النازعات', verseCount: 46 },
  { number: 80, name: 'Abasa', arabicName: 'عبس', verseCount: 42 },
  { number: 81, name: 'At-Takwir', arabicName: 'التكوير', verseCount: 29 },
  { number: 82, name: 'Al-Infitar', arabicName: 'الإنفطار', verseCount: 19 },
  { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', verseCount: 36 },
  { number: 84, name: 'Al-Inshiqaq', arabicName: 'الإنشقاق', verseCount: 25 },
  { number: 85, name: 'Al-Buruj', arabicName: 'البروج', verseCount: 22 },
  { number: 86, name: 'At-Tariq', arabicName: 'الطارق', verseCount: 17 },
  { number: 87, name: 'Al-A\'la', arabicName: 'الأعلى', verseCount: 19 },
  { number: 88, name: 'Al-Ghashiyah', arabicName: 'الغاشية', verseCount: 26 },
  { number: 89, name: 'Al-Fajr', arabicName: 'الفجر', verseCount: 30 },
  { number: 90, name: 'Al-Balad', arabicName: 'البلد', verseCount: 20 },
  { number: 91, name: 'Ash-Shams', arabicName: 'الشمس', verseCount: 15 },
  { number: 92, name: 'Al-Layl', arabicName: 'الليل', verseCount: 21 },
  { number: 93, name: 'Ad-Duhaa', arabicName: 'الضحى', verseCount: 11 },
  { number: 94, name: 'Ash-Sharh', arabicName: 'الشرح', verseCount: 8 },
  { number: 95, name: 'At-Tin', arabicName: 'التين', verseCount: 8 },
  { number: 96, name: 'Al-\'Alaq', arabicName: 'العلق', verseCount: 19 },
  { number: 97, name: 'Al-Qadr', arabicName: 'القدر', verseCount: 5 },
  { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة', verseCount: 8 },
  { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', verseCount: 8 },
  { number: 100, name: 'Al-\'Adiyat', arabicName: 'العاديات', verseCount: 11 },
  { number: 101, name: 'Al-Qari\'ah', arabicName: 'القارعة', verseCount: 11 },
  { number: 102, name: 'At-Takathur', arabicName: 'التكاثر', verseCount: 8 },
  { number: 103, name: 'Al-\'Asr', arabicName: 'العصر', verseCount: 3 },
  { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة', verseCount: 9 },
  { number: 105, name: 'Al-Fil', arabicName: 'الفيل', verseCount: 5 },
  { number: 106, name: 'Quraysh', arabicName: 'قريش', verseCount: 4 },
  { number: 107, name: 'Al-Ma\'un', arabicName: 'الماعون', verseCount: 7 },
  { number: 108, name: 'Al-Kawthar', arabicName: 'الكوثر', verseCount: 3 },
  { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', verseCount: 6 },
  { number: 110, name: 'An-Nasr', arabicName: 'النصر', verseCount: 3 },
  { number: 111, name: 'Al-Masad', arabicName: 'المسد', verseCount: 5 },
  { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', verseCount: 4 },
  { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', verseCount: 5 },
  { number: 114, name: 'An-Nas', arabicName: 'الناس', verseCount: 6 }
]

async function main() {
  console.log('🌱 Starting seed...')

  // Create Roles
  console.log('Creating roles...')
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', guardName: 'web' }
  })

  const teacherRole = await prisma.role.upsert({
    where: { name: 'teacher' },
    update: {},
    create: { name: 'teacher', guardName: 'web' }
  })

  const guardianRole = await prisma.role.upsert({
    where: { name: 'wali' },
    update: {},
    create: { name: 'wali', guardName: 'web' }
  })

  const studentRole = await prisma.role.upsert({
    where: { name: 'student' },
    update: {},
    create: { name: 'student', guardName: 'web' }
  })

  console.log('✅ Roles created')

  // Create Permissions
  console.log('Creating permissions...')
  const permissions = [
    'manage-users',
    'manage-roles',
    'manage-students',
    'manage-teachers',
    'manage-guardians',
    'manage-classes',
    'manage-hafalans',
    'view-analytics',
    'view-reports',
    'export-data',
    'import-data'
  ]

  for (const permName of permissions) {
    await prisma.permission.upsert({
      where: { name: permName },
      update: {},
      create: { name: permName, guardName: 'web' }
    })
  }

  console.log('✅ Permissions created')

  // Assign all permissions to admin role
  console.log('Assigning permissions to admin role...')
  const allPermissions = await prisma.permission.findMany()
  
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        permissionId_roleId: {
          permissionId: perm.id,
          roleId: adminRole.id
        }
      },
      update: {},
      create: {
        permissionId: perm.id,
        roleId: adminRole.id
      }
    })
  }

  console.log('✅ Permissions assigned to admin')

  // Create default admin user
  console.log('Creating default admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hafalan.app' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@hafalan.app',
      password: hashedPassword,
      emailVerifiedAt: new Date(),
      mustChangePassword: true
    }
  })

  // Assign admin role to user
  await prisma.userRole.upsert({
    where: {
      userId_roleId_modelType: {
        userId: adminUser.id,
        roleId: adminRole.id,
        modelType: 'App\\Models\\User'
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
      modelType: 'App\\Models\\User'
    }
  })

  // Create admin profile
  await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      phone: '081234567890',
      address: 'Admin Address'
    }
  })

  console.log('✅ Admin user created (email: admin@hafalan.app, password: admin123)')

  // Seed Surahs
  console.log('Creating surahs...')
  for (const surah of surahs) {
    await prisma.surah.upsert({
      where: { number: surah.number },
      update: {},
      create: surah
    })
  }

  console.log('✅ 114 Surahs created')

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
