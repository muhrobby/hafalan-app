<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-book-open" class="w-8 h-8 text-primary-500" />
            <span class="text-xl font-bold text-gray-900 dark:text-white">Hafalan App</span>
          </div>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            class="lg:hidden"
            @click="sidebarOpen = false"
          />
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <!-- Dashboard -->
          <SidebarLink
            to="/dashboard"
            icon="i-heroicons-home"
            label="Dashboard"
          />

          <!-- Students -->
          <SidebarLink
            v-if="hasPermission('view_students')"
            to="/students"
            icon="i-heroicons-academic-cap"
            label="Siswa"
          />

          <!-- Teachers -->
          <SidebarLink
            v-if="hasPermission('view_teachers')"
            to="/teachers"
            icon="i-heroicons-user-group"
            label="Guru"
          />

          <!-- Guardians -->
          <SidebarLink
            v-if="hasPermission('view_guardians')"
            to="/guardians"
            icon="i-heroicons-users"
            label="Wali Murid"
          />

          <!-- Classes -->
          <SidebarLink
            v-if="hasPermission('view_classes')"
            to="/classes"
            icon="i-heroicons-building-office-2"
            label="Kelas"
          />

          <!-- Hafalan -->
          <SidebarLink
            v-if="hasPermission('view_hafalan')"
            to="/hafalan"
            icon="i-heroicons-book-open"
            label="Hafalan"
          />

          <!-- Analytics -->
          <SidebarLink
            v-if="hasPermission('view_analytics')"
            to="/analytics"
            icon="i-heroicons-chart-bar"
            label="Analitik"
          />

          <!-- User Management -->
          <SidebarLink
            v-if="hasPermission('manage_users')"
            to="/users"
            icon="i-heroicons-user-circle"
            label="Manajemen User"
          />

          <!-- Audit Logs -->
          <SidebarLink
            v-if="hasPermission('view_audit_logs')"
            to="/audit-logs"
            icon="i-heroicons-document-text"
            label="Audit Log"
          />
        </nav>

        <!-- User Menu -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <UDropdown
            :items="userMenuItems"
            :popper="{ placement: 'top' }"
          >
            <div class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <UAvatar
                :alt="user?.name"
                size="sm"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ user?.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ user?.email }}
                </p>
              </div>
              <UIcon name="i-heroicons-chevron-up-down" class="w-5 h-5 text-gray-400" />
            </div>
          </UDropdown>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="lg:pl-64">
      <!-- Top Bar -->
      <header class="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <UButton
            icon="i-heroicons-bars-3"
            color="gray"
            variant="ghost"
            class="lg:hidden"
            @click="sidebarOpen = true"
          />

          <div class="flex items-center gap-4 ml-auto">
            <!-- Notifications -->
            <UButton
              icon="i-heroicons-bell"
              color="gray"
              variant="ghost"
            />

            <!-- Theme Toggle -->
            <ClientOnly>
              <UButton
                :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
                color="gray"
                variant="ghost"
                @click="toggleColorMode"
              />
            </ClientOnly>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>

    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const colorMode = useColorMode()
const router = useRouter()

const { user, hasPermission } = storeToRefs(authStore)
const sidebarOpen = ref(false)

const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const userMenuItems = [
  [{
    label: 'Profile',
    icon: 'i-heroicons-user',
    click: () => router.push('/profile')
  }, {
    label: 'Pengaturan',
    icon: 'i-heroicons-cog-6-tooth',
    click: () => router.push('/settings')
  }], [{
    label: 'Logout',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: async () => {
      await authStore.logout()
      router.push('/login')
    }
  }]
]
</script>
