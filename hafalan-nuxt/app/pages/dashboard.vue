<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Hafalan App</h1>
            </div>
          </div>
          <div class="flex items-center">
            <span class="text-gray-700 mr-4">{{ user?.name }}</span>
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Welcome to Hafalan App (Nuxt 3)
                </h3>
                <div class="mt-5">
                  <p class="text-sm text-gray-500">
                    You are logged in as: <strong>{{ user?.email }}</strong>
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    Roles: <strong>{{ user?.roles.join(', ') }}</strong>
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    This is the new Full-Stack Nuxt 3 implementation.
                  </p>
                </div>

                <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Students
                      </dt>
                      <dd class="mt-1 text-3xl font-semibold text-gray-900">
                        0
                      </dd>
                    </div>
                  </div>

                  <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Teachers
                      </dt>
                      <dd class="mt-1 text-3xl font-semibold text-gray-900">
                        0
                      </dd>
                    </div>
                  </div>

                  <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Guardians
                      </dt>
                      <dd class="mt-1 text-3xl font-semibold text-gray-900">
                        0
                      </dd>
                    </div>
                  </div>

                  <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Classes
                      </dt>
                      <dd class="mt-1 text-3xl font-semibold text-gray-900">
                        0
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const user = computed(() => authStore.user)

// Fetch user on mount if not already loaded
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      // Redirect to login if not authenticated
      await navigateTo('/login')
    }
  }
})

async function handleLogout() {
  await authStore.logout()
}
</script>
