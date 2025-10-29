<template>
  <UCard>
    <!-- Header with Search and Actions -->
    <template #header>
      <div class="flex items-center justify-between gap-4">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Cari..."
          class="w-full sm:w-64"
        />
        <slot name="actions" />
      </div>
    </template>

    <!-- Table -->
    <UTable
      :rows="filteredRows"
      :columns="columns"
      :loading="loading"
      :empty-state="{ icon: 'i-heroicons-circle-stack', label: emptyLabel }"
    >
      <!-- Custom Slots -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </UTable>

    <!-- Pagination -->
    <template v-if="pagination && filteredRows.length > 0" #footer>
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Menampilkan {{ ((page - 1) * pageSize) + 1 }} - {{ Math.min(page * pageSize, filteredRows.length) }} dari {{ filteredRows.length }} data
        </p>
        <UPagination
          v-model="page"
          :page-count="pageSize"
          :total="filteredRows.length"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  rows: any[]
  columns: any[]
  loading?: boolean
  searchFields?: string[]
  emptyLabel?: string
  pagination?: boolean
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchFields: () => [],
  emptyLabel: 'Tidak ada data',
  pagination: true,
  pageSize: 10
})

const search = ref('')
const page = ref(1)

const filteredRows = computed(() => {
  let filtered = props.rows

  // Search filter
  if (search.value && props.searchFields.length > 0) {
    const searchLower = search.value.toLowerCase()
    filtered = filtered.filter(row =>
      props.searchFields.some(field =>
        String(row[field] || '').toLowerCase().includes(searchLower)
      )
    )
  }

  // Pagination
  if (props.pagination) {
    const start = (page.value - 1) * props.pageSize
    const end = start + props.pageSize
    return filtered.slice(start, end)
  }

  return filtered
})

// Reset page when search changes
watch(search, () => {
  page.value = 1
})
</script>
