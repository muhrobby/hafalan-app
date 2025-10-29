<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out shadow-xl',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="flex flex-col h-full overflow-hidden">
        <!-- Logo & Brand -->
        <div class="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-blue-600 flex-shrink-0">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="bg-white dark:bg-gray-800 p-1.5 sm:p-2 rounded-lg shadow-lg">
              <UIcon name="i-heroicons-book-open-20-solid" class="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <span class="text-base sm:text-lg font-bold text-white">Hafalan App</span>
              <p class="text-xs text-green-100">v1.0.0</p>
            </div>
          </div>
          <button
            @click="sidebarOpen = false"
            class="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <UIcon name="i-heroicons-x-mark-20-solid" class="w-5 h-5" />
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <!-- Main Menu Section -->
          <div class="mb-4 sm:mb-6">
            <p class="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Menu Utama
            </p>
            
            <SidebarLink
              to="/dashboard"
              icon="i-heroicons-home-20-solid"
              label="Dashboard"
              @click="sidebarOpen = false"
            />

            <SidebarLink
              v-if="hasPermission('view_students')"
              to="/students"
              icon="i-heroicons-academic-cap-20-solid"
              label="Siswa"
              :badge="studentCount"
              @click="sidebarOpen = false"
            />

            <SidebarLink
              v-if="hasPermission('view_teachers')"
              to="/teachers"
              icon="i-heroicons-user-group-20-solid"
              label="Guru"
              @click="sidebarOpen = false"
            />

            <SidebarLink
              v-if="hasPermission('view_guardians')"
              to="/guardians"
              icon="i-heroicons-users-20-solid"
              label="Wali Murid"
              @click="sidebarOpen = false"
            />

            <SidebarLink
              v-if="hasPermission('view_classes')"
              to="/classes"
              icon="i-heroicons-building-office-2-20-solid"
              label="Kelas"
              @click="sidebarOpen = false"
            />
          </div>

          <!-- Hafalan Section -->
          <div class="mb-4 sm:mb-6">
            <p class="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Hafalan
            </p>
            
            <SidebarLink
              v-if="hasPermission('view_hafalan')"
              to="/hafalan"
              icon="i-heroicons-book-open-20-solid"
              label="Data Hafalan"
              @click="sidebarOpen = false"
            />

            <SidebarLink
              v-if="hasPermission('view_analytics')"
              to="/analytics"
              icon="i-heroicons-chart-bar-20-solid"
              label="Analitik & Laporan"
              @click="sidebarOpen = false"
            />
          </div>

          <!-- Settings Section -->
          <div>
            <p class="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pengaturan
            </p>
            
            <SidebarLink
              v-if="hasPermission('manage_users')"
              to="/users"
              icon="i-heroicons-user-circle-20-solid"
              label="Manajemen User"
              @click="sidebarOpen = false"
            />

            <SidebarLink
              v-if="hasPermission('view_audit_logs')"
              to="/audit-logs"
              icon="i-heroicons-document-text-20-solid"
              label="Audit Log"
              @click="sidebarOpen = false"
            />
          </div>
        </nav>

        <!-- User Profile Card -->
        <div class="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          <UDropdown
            :items="userMenuItems"
            :popper="{ placement: 'top-start' }"
            class="w-full"
          >
            <button class="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700">
              <div class="relative flex-shrink-0">
                <UAvatar
                  :alt="user?.name"
                  size="sm"
                  class="ring-2 ring-green-500"
                />
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
              </div>
              <div class="flex-1 min-w-0 text-left">
                <p class="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ user?.name || 'User' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ user?.email || 'user@example.com' }}
                </p>
              </div>
              <UIcon name="i-heroicons-chevron-up-down-20-solid" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            </button>
          </UDropdown>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="lg:pl-72 min-h-screen flex flex-col">
      <!-- Top Navigation Bar -->
      <header class="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center justify-between h-16 px-3 sm:px-4 lg:px-6">
          <!-- Mobile Menu Button -->
          <button
            @click="sidebarOpen = true"
            class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open menu"
          >
            <UIcon name="i-heroicons-bars-3-20-solid" class="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          <!-- Page Title/Breadcrumb - Hidden on mobile when there are actions -->
          <div class="hidden md:block">
            <h1 class="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
              {{ pageTitle }}
            </h1>
          </div>

          <!-- Right Side Actions -->
          <div class="flex items-center gap-1 sm:gap-2 ml-auto">
            <!-- Search Button -->
            <UButton
              icon="i-heroicons-magnifying-glass-20-solid"
              variant="ghost"
              size="md"
              class="hidden sm:flex"
              aria-label="Search"
            />

            <!-- Notifications -->
            <UButton
              icon="i-heroicons-bell-20-solid"
              variant="ghost"
              size="md"
              aria-label="Notifications"
            >
              <template #trailing>
                <span class="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </template>
            </UButton>

            <!-- Theme Toggle -->
            <ClientOnly>
              <UButton
                :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                variant="ghost"
                size="md"
                @click="toggleColorMode"
                aria-label="Toggle theme"
              />
            </ClientOnly>

            <!-- Quick Actions Dropdown - Hidden on mobile -->
            <UDropdown
              :items="quickActions"
              :popper="{ placement: 'bottom-end' }"
              class="hidden sm:block"
            >
              <UButton
                icon="i-heroicons-plus-circle-20-solid"
                color="primary"
                size="md"
                class="hidden lg:flex"
              >
                Buat Baru
              </UButton>
              <UButton
                icon="i-heroicons-plus-circle-20-solid"
                color="primary"
                size="md"
                class="lg:hidden"
                aria-label="Quick actions"
              />
            </UDropdown>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto w-full">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-auto">
        <div class="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
              © {{ new Date().getFullYear() }} Hafalan App. All rights reserved.
            </p>
            <div class="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <a href="#" class="hover:text-green-600 dark:hover:text-green-400 transition-colors">Bantuan</a>
              <a href="#" class="hover:text-green-600 dark:hover:text-green-400 transition-colors">Dokumentasi</a>
              <a href="#" class="hover:text-green-600 dark:hover:text-green-400 transition-colors">Kontak</a>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-gray-900/75 backdrop-blur-sm lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const colorMode = useColorMode()
const router = useRouter()
const route = useRoute()

const { user } = storeToRefs(authStore)
const sidebarOpen = ref(false)
const studentCount = ref(0)

const isDark = computed(() => colorMode.value === 'dark')

// Check if user has permission
const hasPermission = (permission: string) => {
  return authStore.hasPermission(permission)
}

// Page title from route meta or default
const pageTitle = computed(() => {
  return route.meta.title as string || 'Dashboard'
})

const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// User dropdown menu items
const userMenuItems = [
  [{
    label: user.value?.name || 'Profile',
    icon: 'i-heroicons-user-20-solid',
    disabled: true,
  }], [{
    label: 'Profil Saya',
    icon: 'i-heroicons-user-circle-20-solid',
    click: () => router.push('/profile')
  }, {
    label: 'Pengaturan',
    icon: 'i-heroicons-cog-6-tooth-20-solid',
    click: () => router.push('/settings')
  }], [{
    label: 'Logout',
    icon: 'i-heroicons-arrow-right-on-rectangle-20-solid',
    click: async () => {
      await authStore.logout()
      router.push('/login')
    }
  }]
]

// Quick actions menu
const quickActions = [[{
  label: 'Tambah Siswa',
  icon: 'i-heroicons-academic-cap-20-solid',
  click: () => router.push('/students?action=create')
}, {
  label: 'Tambah Guru',
  icon: 'i-heroicons-user-group-20-solid',
  click: () => router.push('/teachers?action=create')
}, {
  label: 'Input Hafalan',
  icon: 'i-heroicons-book-open-20-solid',
  click: () => router.push('/hafalan?action=create')
}]]

// Fetch student count for badge (optional)
onMounted(async () => {
  try {
    const response = await $fetch('/api/dashboard/stats') as any
    studentCount.value = response.totalStudents || 0
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
})
</script>
