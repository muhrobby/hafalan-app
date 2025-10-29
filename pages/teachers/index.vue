<template>
  <div class="space-y-6">
    <PageHeader title="Teachers" description="Manage all teachers and their class assignments" />

    <div class="grid gap-6">
      <!-- Add Teacher Button -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <UInput
            v-model="searchQuery"
            placeholder="Search by name, email, or NIP..."
            icon="i-heroicons-magnifying-glass-20-solid"
            size="lg"
            class="w-80"
          />
        </div>
        <UButton
          icon="i-heroicons-plus-20-solid"
          size="lg"
          @click="isFormModalOpen = true"
        >
          Add Teacher
        </UButton>
      </div>

      <!-- Teachers Table -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Teachers List</h3>
            <div class="text-sm text-gray-500">
              {{ pagination.total }} total teachers
            </div>
          </div>
        </template>

        <div v-if="loading" class="flex justify-center py-12">
          <USpin />
        </div>

        <div v-else-if="teachers.length === 0" class="text-center py-12">
          <p class="text-gray-500">No teachers found</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-4 py-3 text-left font-semibold text-sm">NIP</th>
                <th class="px-4 py-3 text-left font-semibold text-sm">Name</th>
                <th class="px-4 py-3 text-left font-semibold text-sm">Email</th>
                <th class="px-4 py-3 text-left font-semibold text-sm">Phone</th>
                <th class="px-4 py-3 text-left font-semibold text-sm">Classes</th>
                <th class="px-4 py-3 text-left font-semibold text-sm">Status</th>
                <th class="px-4 py-3 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="teacher in teachers"
                :key="teacher.id"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-4 py-3">
                  <span class="font-mono text-sm font-medium">{{ teacher.nip }}</span>
                </td>
                <td class="px-4 py-3 font-medium">{{ teacher.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {{ teacher.email }}
                </td>
                <td class="px-4 py-3 text-sm">{{ teacher.phone || '-' }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <UBadge
                      v-for="className in teacher.classes"
                      :key="className"
                      color="primary"
                      variant="soft"
                      size="sm"
                    >
                      {{ className }}
                    </UBadge>
                    <span v-if="teacher.classes.length === 0" class="text-sm text-gray-500">
                      No classes
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <UBadge color="success" variant="soft">Active</UBadge>
                </td>
                <td class="px-4 py-3">
    <div class="flex gap-2">
      <UButton
        icon="i-heroicons-pencil-20-solid"
        size="sm"
        variant="ghost"
        @click="editTeacher(teacher)"
        title="Edit teacher"
      />
      <UButton
        icon="i-heroicons-trash-20-solid"
        size="sm"
        color="error"
        variant="ghost"
        @click="deleteTeacher(teacher.id)"
        title="Delete teacher"
      />
    </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <template #footer>
          <div class="flex justify-between items-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Showing {{ (pagination.page - 1) * pagination.perPage + 1 }} to
              {{ Math.min(pagination.page * pagination.perPage, pagination.total) }} of
              {{ pagination.total }} teachers
            </p>
            <UPagination
              v-model="pagination.page"
              :page-count="pagination.perPage"
              :total="pagination.total"
              :active-button="{ variant: 'soft' }"
            />
          </div>
        </template>
      </UCard>
    </div>

    <!-- Teacher Form Modal -->
    <TeacherFormModal
      v-model="isFormModalOpen"
      :teacher="selectedTeacher"
      @submitted="handleFormSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Teacher {
  id: number
  nip: string
  name: string
  email: string
  phone?: string
  gender?: string
  birthDate?: string
  birthPlace?: string
  address?: string
  classes: string[]
}

interface Pagination {
  page: number
  perPage: number
  total: number
}

const teachers = ref<Teacher[]>([])
const loading = ref(false)
const searchQuery = ref('')
const isFormModalOpen = ref(false)
const selectedTeacher = ref<Teacher | null>(null)

const pagination = ref<Pagination>({
  page: 1,
  perPage: 10,
  total: 0
})

// Fetch teachers
const fetchTeachers = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/teachers', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.perPage,
        search: searchQuery.value || undefined
      }
    }) as any

    teachers.value = response.data || []
    pagination.value.total = response.meta?.total || 0
  } catch (error) {
    console.error('Error fetching teachers:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to fetch teachers',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Edit teacher
const editTeacher = (teacher: Teacher) => {
  selectedTeacher.value = { ...teacher }
  isFormModalOpen.value = true
}

// Delete teacher
const deleteTeacher = async (id: number) => {
  // Using simple confirmation instead of useConfirmDialog
  const confirmed = window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')
  if (!confirmed) return

  try {
    await $fetch(`/api/teachers/${id}`, { method: 'DELETE' })
    useToast().add({
      title: 'Success',
      description: 'Teacher deleted successfully',
      color: 'success'
    })
    await fetchTeachers()
  } catch (error) {
    console.error('Error deleting teacher:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to delete teacher',
      color: 'error'
    })
  }
}

// Handle form submission
const handleFormSubmit = async () => {
  isFormModalOpen.value = false
  selectedTeacher.value = null
  await fetchTeachers()
}

// Watchers
watch(() => pagination.value.page, () => fetchTeachers())
watch(() => searchQuery.value, () => {
  pagination.value.page = 1
  fetchTeachers()
})

// Initial load
onMounted(() => {
  fetchTeachers()
})

definePageMeta({
  middleware: 'auth'
})
</script>
