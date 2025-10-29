<template>
  <UCard>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ title }}
        </p>
        <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {{ value }}
        </p>
        <div v-if="change !== undefined" class="mt-2 flex items-center gap-1">
          <UIcon
            :name="change >= 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
            :class="[
              'w-4 h-4',
              change >= 0 ? 'text-green-600' : 'text-red-600'
            ]"
          />
          <span
            :class="[
              'text-sm font-medium',
              change >= 0 ? 'text-green-600' : 'text-red-600'
            ]"
          >
            {{ Math.abs(change) }}%
          </span>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ changeLabel || 'vs bulan lalu' }}
          </span>
        </div>
      </div>
      <div
        :class="[
          'p-3 rounded-full',
          iconColor === 'primary' && 'bg-primary-100 dark:bg-primary-900/20',
          iconColor === 'green' && 'bg-green-100 dark:bg-green-900/20',
          iconColor === 'blue' && 'bg-blue-100 dark:bg-blue-900/20',
          iconColor === 'purple' && 'bg-purple-100 dark:bg-purple-900/20',
          iconColor === 'orange' && 'bg-orange-100 dark:bg-orange-900/20'
        ]"
      >
        <UIcon
          :name="icon"
          :class="[
            'w-6 h-6',
            iconColor === 'primary' && 'text-primary-600',
            iconColor === 'green' && 'text-green-600',
            iconColor === 'blue' && 'text-blue-600',
            iconColor === 'purple' && 'text-purple-600',
            iconColor === 'orange' && 'text-orange-600'
          ]"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon: string
  iconColor?: 'primary' | 'green' | 'blue' | 'purple' | 'orange'
  change?: number
  changeLabel?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'primary'
})
</script>
