<template>
  <NuxtLink
    :to="to"
    :class="[
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    ]"
  >
    <UIcon :name="icon" class="w-5 h-5" />
    <span>{{ label }}</span>
    <UBadge v-if="badge" :color="badgeColor" size="xs" class="ml-auto">
      {{ badge }}
    </UBadge>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  to: string
  icon: string
  label: string
  badge?: string | number
  badgeColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  badgeColor: 'primary'
})

const route = useRoute()

const isActive = computed(() => {
  return route.path === props.to || route.path.startsWith(props.to + '/')
})
</script>
