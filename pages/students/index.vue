<template>
  <div>
    <PageHeader title="Data Siswa" description="Kelola data siswa">
      <template #actions>
        <UButton
          icon="i-heroicons-plus"
          @click="openCreateModal"
        >
          Tambah Siswa
        </UButton>
      </template>
    </PageHeader>

    <!-- Filters & Search -->
    <UCard class="mb-6">
      <div class="flex items-center gap-4">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Cari nama, email, atau NIS..."
          class="flex-1"
        />
        <UButton
          icon="i-heroicons-arrow-path"
          color="gray"
          variant="soft"
          @click="refresh"
        >
          Refresh
        </UButton>
        <UButton
          icon="i-heroicons-arrow-down-tray"
          color="gray"
          variant="soft"
          @click="exportData"
        >
          Export
        </UButton>
      </div>
    </UCard>

    <!-- Students Table -->
    <UCard>
      <UTable
        :rows="students"
        :columns="columns"
        :loading="pending"
        :empty-state="{ icon: 'i-heroicons-academic-cap', label: 'Tidak ada data siswa' }"
      >
        <template #name-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :alt="row.name" size="sm" />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ row.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ row.email }}</p>
            </div>
          </div>
        </template>

        <template #nis-data="{ row }">
          <UBadge color="blue" variant="soft">{{ row.nis }}</UBadge>
        </template>

        <template #gender-data="{ row }">
          <span v-if="row.gender === 'L'">Laki-laki</span>
          <span v-else-if="row.gender === 'P'">Perempuan</span>
          <span v-else class="text-gray-400">-</span>
        </template>

        <template #classes-data="{ row }">
          <div v-if="row.classes && row.classes.length > 0" class="flex flex-wrap gap-1">
            <UBadge
              v-for="className in row.classes"
              :key="className"
              color="purple"
              variant="soft"
              size="xs"
            >
              {{ className }}
            </UBadge>
          </div>
          <span v-else class="text-gray-400 text-sm">-</span>
        </template>

        <template #isActive-data="{ row }">
          <UBadge :color="row.isActive ? 'green' : 'red'" variant="soft">
            {{ row.isActive ? 'Aktif' : 'Nonaktif' }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <UDropdown :items="getActionItems(row)">
            <UButton
              icon="i-heroicons-ellipsis-vertical"
              color="gray"
              variant="ghost"
              size="sm"
            />
          </UDropdown>
        </template>
      </UTable>

      <!-- Pagination -->
      <template #footer>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {{ ((page - 1) * limit) + 1 }} - {{ Math.min(page * limit, meta?.total || 0) }} dari {{ meta?.total || 0 }} siswa
          </p>
          <UPagination
            v-model="page"
            :page-count="limit"
            :total="meta?.total || 0"
          />
        </div>
      </template>
    </UCard>

    <!-- Student Form Modal -->
    <UModal v-model="isModalOpen" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingStudent ? 'Edit Siswa' : 'Tambah Siswa' }}
          </h3>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Nama Lengkap" required>
              <UInput v-model="form.name" placeholder="John Doe" />
            </UFormGroup>

            <UFormGroup label="Email" required>
              <UInput v-model="form.email" type="email" placeholder="john@example.com" />
            </UFormGroup>

            <UFormGroup label="NIS" :help="editingStudent ? undefined : 'Kosongkan untuk generate otomatis'">
              <UInput v-model="form.nis" placeholder="20250001" />
            </UFormGroup>

            <UFormGroup label="Jenis Kelamin">
              <USelect
                v-model="form.gender"
                :options="[
                  { label: 'Laki-laki', value: 'L' },
                  { label: 'Perempuan', value: 'P' }
                ]"
                placeholder="Pilih jenis kelamin"
              />
            </UFormGroup>

            <UFormGroup label="Tempat Lahir">
              <UInput v-model="form.birthPlace" placeholder="Jakarta" />
            </UFormGroup>

            <UFormGroup label="Tanggal Lahir">
              <UInput v-model="form.birthDate" type="date" />
            </UFormGroup>

            <UFormGroup label="No. Telepon">
              <UInput v-model="form.phone" placeholder="08123456789" />
            </UFormGroup>

            <UFormGroup label="Kelas">
              <USelectMenu
                v-model="selectedClasses"
                :options="classes"
                option-attribute="name"
                value-attribute="id"
                multiple
                placeholder="Pilih kelas"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="Alamat">
            <UTextarea v-model="form.address" placeholder="Alamat lengkap" rows="2" />
          </UFormGroup>

          <div v-if="!editingStudent" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p class="text-xs text-blue-800 dark:text-blue-200">
              <strong>Password default:</strong> student123 (Siswa akan diminta mengubah password saat login pertama kali)
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <UButton
              type="button"
              color="gray"
              variant="soft"
              @click="closeModal"
            >
              Batal
            </UButton>
            <UButton
              type="submit"
              :loading="submitting"
            >
              {{ editingStudent ? 'Simpan' : 'Tambah' }}
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Konfirmasi Hapus</h3>
        </template>

        <p class="text-gray-700 dark:text-gray-300 mb-4">
          Apakah Anda yakin ingin menghapus siswa <strong>{{ deletingStudent?.name }}</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div class="flex justify-end gap-3">
          <UButton
            color="gray"
            variant="soft"
            @click="isDeleteModalOpen = false"
          >
            Batal
          </UButton>
          <UButton
            color="red"
            :loading="deleting"
            @click="confirmDelete"
          >
            Hapus
          </UButton>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()

// State
const search = ref('')
const page = ref(1)
const limit = ref(10)
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingStudent = ref<any>(null)
const deletingStudent = ref<any>(null)
const submitting = ref(false)
const deleting = ref(false)
const selectedClasses = ref<number[]>([])

const form = reactive({
  name: '',
  email: '',
  nis: '',
  gender: '',
  birthPlace: '',
  birthDate: '',
  phone: '',
  address: ''
})

// Columns
const columns = [
  { key: 'name', label: 'Nama' },
  { key: 'nis', label: 'NIS' },
  { key: 'gender', label: 'Jenis Kelamin' },
  { key: 'phone', label: 'Telepon' },
  { key: 'classes', label: 'Kelas' },
  { key: 'isActive', label: 'Status' },
  { key: 'actions', label: '' }
]

// Fetch students
const { data, pending, refresh } = await useFetch('/api/students', {
  query: {
    page,
    limit,
    search
  },
  watch: [page, search]
})

const students = computed(() => data.value?.data || [])
const meta = computed(() => data.value?.meta)

// Fetch classes for dropdown
const { data: classesData } = await useFetch('/api/classes')
const classes = computed(() => classesData.value || [])

// Actions dropdown
function getActionItems(row: any) {
  return [[
    {
      label: 'Detail',
      icon: 'i-heroicons-eye',
      click: () => viewStudent(row)
    },
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil',
      click: () => editStudent(row)
    },
    {
      label: 'Hapus',
      icon: 'i-heroicons-trash',
      click: () => deleteStudent(row)
    }
  ]]
}

// Modal handlers
function openCreateModal() {
  editingStudent.value = null
  resetForm()
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingStudent.value = null
  resetForm()
}

function resetForm() {
  form.name = ''
  form.email = ''
  form.nis = ''
  form.gender = ''
  form.birthPlace = ''
  form.birthDate = ''
  form.phone = ''
  form.address = ''
  selectedClasses.value = []
}

function viewStudent(student: any) {
  navigateTo(`/students/${student.id}`)
}

async function editStudent(student: any) {
  editingStudent.value = student
  form.name = student.name
  form.email = student.email
  form.nis = student.nis
  form.gender = student.gender
  form.birthPlace = student.birthPlace
  form.birthDate = student.birthDate ? student.birthDate.split('T')[0] : ''
  form.phone = student.phone
  form.address = student.address
  
  // Get full student data to populate classes
  const { data: fullStudent } = await useFetch(`/api/students/${student.id}`)
  if (fullStudent.value) {
    selectedClasses.value = fullStudent.value.classes.map((c: any) => c.id)
  }
  
  isModalOpen.value = true
}

function deleteStudent(student: any) {
  deletingStudent.value = student
  isDeleteModalOpen.value = true
}

async function handleSubmit() {
  submitting.value = true

  try {
    const payload = {
      ...form,
      classIds: selectedClasses.value
    }

    if (editingStudent.value) {
      await $fetch(`/api/students/${editingStudent.value.id}`, {
        method: 'PUT',
        body: payload
      })

      toast.add({
        title: 'Berhasil',
        description: 'Data siswa berhasil diperbarui',
        color: 'green'
      })
    } else {
      await $fetch('/api/students', {
        method: 'POST',
        body: payload
      })

      toast.add({
        title: 'Berhasil',
        description: 'Siswa baru berhasil ditambahkan',
        color: 'green'
      })
    }

    closeModal()
    refresh()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Terjadi kesalahan',
      color: 'red'
    })
  } finally {
    submitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingStudent.value) return

  deleting.value = true

  try {
    await $fetch(`/api/students/${deletingStudent.value.id}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'Berhasil',
      description: 'Siswa berhasil dihapus',
      color: 'green'
    })

    isDeleteModalOpen.value = false
    deletingStudent.value = null
    refresh()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Terjadi kesalahan',
      color: 'red'
    })
  } finally {
    deleting.value = false
  }
}

function exportData() {
  const ws = XLSX.utils.json_to_sheet(students.value.map(s => ({
    NIS: s.nis,
    Nama: s.name,
    Email: s.email,
    'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : '-',
    Telepon: s.phone,
    Kelas: s.classes.join(', '),
    Status: s.isActive ? 'Aktif' : 'Nonaktif'
  })))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Students')
  XLSX.writeFile(wb, `students-${new Date().toISOString().split('T')[0]}.xlsx`)

  toast.add({
    title: 'Berhasil',
    description: 'Data siswa berhasil diexport',
    color: 'green'
  })
}
</script>
