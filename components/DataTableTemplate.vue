<script setup lang="ts" generic="T">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

interface Props {
  title: string
  description?: string
  items: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  onRowClick?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchPlaceholder: 'Search...'
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:search': [query: string]
}>()

const search = ref('')
const selectedRows = ref<Set<number>>(new Set())
const currentPage = computed({
  get: () => props.pagination?.page || 1,
  set: (value) => emit('update:page', value)
})

const handleSearch = (query: string) => {
  search.value = query
  emit('update:search', query)
  props.onSearch?.(query)
}

const UCheckbox = resolveComponent('UCheckbox')
const UIcon = resolveComponent('UIcon')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

// Add action column
const enhancedColumns = computed(() => {
  const cols = [...props.columns]
  
  if (props.onEdit || props.onDelete) {
    cols.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const items = [
          props.onEdit && {
            label: 'Edit',
            icon: 'i-heroicons-pencil',
            onClick: () => props.onEdit?.(row.original)
          },
          props.onDelete && {
            label: 'Delete',
            icon: 'i-heroicons-trash',
            color: 'error' as const,
            onClick: () => props.onDelete?.(row.original)
          }
        ].filter(Boolean)

        return h(
          UDropdownMenu,
          { items: [items] },
          () => h(
            UButton,
            {
              icon: 'i-heroicons-ellipsis-vertical',
              color: 'gray',
              variant: 'ghost',
              size: 'sm'
            }
          )
        )
      }
    })
  }

  return cols
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <p v-if="description" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {{ description }}
        </p>
      </div>
      <slot name="actions" />
    </div>

    <!-- Search & Actions -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <UInput
        v-model="search"
        :placeholder="searchPlaceholder"
        icon="i-heroicons-magnifying-glass"
        @input="handleSearch"
      />
      <div class="flex gap-2">
        <slot name="toolbar" />
      </div>
    </div>

    <!-- Table -->
    <UTable
      :rows="items"
      :columns="enhancedColumns"
      :loading="loading"
      class="w-full"
      @select="row => onRowClick?.(row)"
    />

    <!-- Pagination -->
    <div v-if="pagination" class="flex items-center justify-between">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} results
      </p>
      <UPagination
        v-model="currentPage"
        :page-count="pagination.totalPages"
        :items-per-page="pagination.limit"
        :total="pagination.total"
      />
    </div>
  </div>
</template>
