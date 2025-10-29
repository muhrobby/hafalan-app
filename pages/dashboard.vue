<template>
  <div>
    <PageHeader
      title="Dashboard"
      description="Selamat datang di Hafalan App"
    />

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard
        title="Total Siswa"
        :value="stats?.totalStudents || 0"
        icon="i-heroicons-academic-cap"
        icon-color="primary"
        :change="stats?.studentsChange"
      />
      <StatCard
        title="Total Guru"
        :value="stats?.totalTeachers || 0"
        icon="i-heroicons-user-group"
        icon-color="green"
        :change="stats?.teachersChange"
      />
      <StatCard
        title="Total Hafalan"
        :value="stats?.totalHafalan || 0"
        icon="i-heroicons-book-open"
        icon-color="blue"
        :change="stats?.hafalanChange"
      />
      <StatCard
        title="Rata-rata Nilai"
        :value="stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : '0%'"
        icon="i-heroicons-chart-bar"
        icon-color="purple"
        :change="stats?.scoreChange"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
      <!-- Hafalan Progress Chart -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Progress Hafalan (30 Hari Terakhir)
          </h3>
        </template>
        <div class="h-64">
          <canvas ref="hafalanChartRef" />
        </div>
      </UCard>

      <!-- Class Performance Chart -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Performa Per Kelas
          </h3>
        </template>
        <div class="h-64">
          <canvas ref="classChartRef" />
        </div>
      </UCard>
    </div>

    <!-- Recent Activities -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Aktivitas Terbaru
        </h3>
      </template>
      <div v-if="pending" class="space-y-4">
        <USkeleton v-for="i in 5" :key="i" class="h-16" />
      </div>
      <div v-else-if="activities && activities.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="py-4 flex items-start gap-4"
        >
          <div
            :class="[
              'p-2 rounded-full',
              activity.type === 'hafalan_created' && 'bg-green-100 dark:bg-green-900/20',
              activity.type === 'student_created' && 'bg-blue-100 dark:bg-blue-900/20',
              activity.type === 'teacher_created' && 'bg-purple-100 dark:bg-purple-900/20'
            ]"
          >
            <UIcon
              :name="getActivityIcon(activity.type)"
              :class="[
                'w-5 h-5',
                activity.type === 'hafalan_created' && 'text-green-600',
                activity.type === 'student_created' && 'text-blue-600',
                activity.type === 'teacher_created' && 'text-purple-600'
              ]"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ activity.description }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ formatDate(activity.createdAt) }}
            </p>
          </div>
        </div>
      </div>
      <div v-else class="py-12 text-center">
        <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Belum ada aktivitas
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

Chart.register(...registerables)

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// Refs
const hafalanChartRef = ref<HTMLCanvasElement>()
const classChartRef = ref<HTMLCanvasElement>()
let hafalanChart: Chart | null = null
let classChart: Chart | null = null

// Fetch data
const { data: stats } = await useFetch('/api/dashboard/stats')
const { data: chartData } = await useFetch('/api/dashboard/chart-data')
const { data: activities, pending } = await useFetch('/api/dashboard/activities')

// Initialize charts
onMounted(() => {
  if (chartData.value) {
    initHafalanChart()
    initClassChart()
  }
})

onUnmounted(() => {
  hafalanChart?.destroy()
  classChart?.destroy()
})

// Initialize Hafalan Progress Chart
function initHafalanChart() {
  if (!hafalanChartRef.value || !chartData.value?.hafalanProgress) return

  const ctx = hafalanChartRef.value.getContext('2d')
  if (!ctx) return

  hafalanChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.value.hafalanProgress.labels,
      datasets: [{
        label: 'Hafalan Baru',
        data: chartData.value.hafalanProgress.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  })
}

// Initialize Class Performance Chart
function initClassChart() {
  if (!classChartRef.value || !chartData.value?.classPerformance) return

  const ctx = classChartRef.value.getContext('2d')
  if (!ctx) return

  classChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.value.classPerformance.labels,
      datasets: [{
        label: 'Rata-rata Nilai',
        data: chartData.value.classPerformance.data,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`
          }
        }
      }
    }
  })
}

function getActivityIcon(type: string) {
  const icons: Record<string, string> = {
    hafalan_created: 'i-heroicons-book-open',
    student_created: 'i-heroicons-user-plus',
    teacher_created: 'i-heroicons-user-group',
    guardian_created: 'i-heroicons-users'
  }
  return icons[type] || 'i-heroicons-information-circle'
}

function formatDate(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id })
}
</script>
