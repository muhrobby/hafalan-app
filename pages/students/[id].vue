<template>
  <div>
    <div class="mb-6">
      <UButton
        icon="i-heroicons-arrow-left"
        color="gray"
        variant="soft"
        @click="$router.back()"
      >
        Kembali
      </UButton>
    </div>

    <div v-if="pending" class="space-y-6">
      <USkeleton class="h-48" />
      <USkeleton class="h-96" />
    </div>

    <div v-else-if="student" class="space-y-6">
      <!-- Student Info Card -->
      <UCard>
        <div class="flex items-start gap-6">
          <UAvatar :alt="student.name" size="xl" />
          <div class="flex-1">
            <div class="flex items-start justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ student.name }}
                </h1>
                <p class="text-gray-500 dark:text-gray-400 mt-1">{{ student.email }}</p>
                <div class="flex items-center gap-2 mt-3">
                  <UBadge color="blue">{{ student.nis }}</UBadge>
                  <UBadge :color="student.isActive ? 'green' : 'red'">
                    {{ student.isActive ? 'Aktif' : 'Nonaktif' }}
                  </UBadge>
                </div>
              </div>
              <UButton
                icon="i-heroicons-pencil"
                color="gray"
                variant="soft"
                @click="navigateTo(`/students/${student.id}/edit`)"
              >
                Edit
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Info Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Personal Info -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Informasi Pribadi</h3>
          </template>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Jenis Kelamin</p>
              <p class="font-medium">{{ getGenderLabel(student.gender) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Tempat, Tanggal Lahir</p>
              <p class="font-medium">
                {{ student.birthPlace }}, {{ formatDate(student.birthDate) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">No. Telepon</p>
              <p class="font-medium">{{ student.phone || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Alamat</p>
              <p class="font-medium">{{ student.address || '-' }}</p>
            </div>
          </div>
        </UCard>

        <!-- Academic Info -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Informasi Akademik</h3>
          </template>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Kelas</p>
              <div v-if="student.classes && student.classes.length > 0" class="flex flex-wrap gap-2">
                <UBadge
                  v-for="cls in student.classes"
                  :key="cls.id"
                  color="purple"
                  variant="soft"
                >
                  {{ cls.name }}
                </UBadge>
              </div>
              <p v-else class="text-gray-400">Belum ada kelas</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Wali Murid</p>
              <div v-if="student.guardians && student.guardians.length > 0" class="space-y-2">
                <div
                  v-for="guardian in student.guardians"
                  :key="guardian.id"
                  class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p class="font-medium">{{ guardian.name }}</p>
                    <p class="text-xs text-gray-500">{{ guardian.relationship }}</p>
                  </div>
                  <UBadge color="green" variant="soft" size="xs">
                    {{ guardian.phone }}
                  </UBadge>
                </div>
              </div>
              <p v-else class="text-gray-400">Belum ada wali murid</p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Hafalan History -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Riwayat Hafalan</h3>
            <UButton
              icon="i-heroicons-plus"
              size="sm"
              @click="navigateTo(`/hafalan/create?studentId=${student.id}`)"
            >
              Tambah Hafalan
            </UButton>
          </div>
        </template>

        <div v-if="student.hafalans && student.hafalans.length > 0">
          <UTable
            :rows="student.hafalans"
            :columns="hafalanColumns"
          >
            <template #surah-data="{ row }">
              <p class="font-medium">{{ row.surah }}</p>
            </template>

            <template #verses-data="{ row }">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Ayat {{ row.verseStart }}-{{ row.verseEnd }}
              </p>
            </template>

            <template #score-data="{ row }">
              <UBadge
                :color="getScoreColor(row.score)"
                variant="soft"
              >
                {{ row.score }}
              </UBadge>
            </template>

            <template #createdAt-data="{ row }">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(row.createdAt) }}
              </p>
            </template>
          </UTable>
        </div>
        <div v-else class="py-12 text-center">
          <UIcon name="i-heroicons-book-open" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">
            Belum ada riwayat hafalan
          </p>
        </div>
      </UCard>
    </div>

    <div v-else class="py-12 text-center">
      <p class="text-gray-500 dark:text-gray-400">Siswa tidak ditemukan</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const studentId = route.params.id

// Fetch student data
const { data: student, pending } = await useFetch(`/api/students/${studentId}`)

// Hafalan table columns
const hafalanColumns = [
  { key: 'surah', label: 'Surah' },
  { key: 'verses', label: 'Ayat' },
  { key: 'score', label: 'Nilai' },
  { key: 'createdAt', label: 'Tanggal' }
]

function getGenderLabel(gender: string) {
  if (gender === 'L') return 'Laki-laki'
  if (gender === 'P') return 'Perempuan'
  return '-'
}

function formatDate(date: string | null) {
  if (!date) return '-'
  return format(new Date(date), 'd MMMM yyyy', { locale: id })
}

function getScoreColor(score: number) {
  if (score >= 90) return 'green'
  if (score >= 75) return 'blue'
  if (score >= 60) return 'yellow'
  return 'red'
}
</script>
