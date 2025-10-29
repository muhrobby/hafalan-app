<template>
  <div class="w-full">
    <!-- Logo & Title -->
    <div class="text-center mb-8">
      <div class="flex justify-center mb-6">
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-lg opacity-30"></div>
          <div class="relative bg-white dark:bg-gray-800 p-4 rounded-full shadow-xl">
            <UIcon name="i-heroicons-book-open-20-solid" class="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Hafalan App
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Sistem Manajemen Hafalan Al-Quran
      </p>
    </div>

    <!-- Login Card -->
    <UCard class="shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Email Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="admin@example.com"
            size="xl"
            :disabled="loading"
            autocomplete="email"
            class="w-full"
          >
            <template #leading>
              <UIcon name="i-heroicons-envelope-20-solid" class="w-5 h-5 text-gray-400" />
            </template>
          </UInput>
        </div>

        <!-- Password Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            size="xl"
            :disabled="loading"
            autocomplete="current-password"
            class="w-full"
          >
            <template #leading>
              <UIcon name="i-heroicons-lock-closed-20-solid" class="w-5 h-5 text-gray-400" />
            </template>
          </UInput>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <label class="flex items-center cursor-pointer">
            <input
              v-model="form.remember"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <button
            type="button"
            @click="handleForgotPassword"
            class="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
          >
            Forgot password?
          </button>
        </div>

        <!-- Submit Button -->
        <UButton
          type="submit"
          block
          size="xl"
          :loading="loading"
          :disabled="!isFormValid"
          class="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          <template #leading>
            <UIcon v-if="!loading" name="i-heroicons-arrow-right-on-rectangle-20-solid" class="w-5 h-5" />
          </template>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </UButton>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">Default Credentials</span>
        </div>
      </div>

      <!-- Default Credentials -->
      <div class="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-information-circle-20-solid" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-gray-900 dark:text-white mb-2">
              Demo Account
            </p>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-600 dark:text-gray-400 w-16">Email:</span>
                <code class="flex-1 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 font-mono">
                  admin@example.com
                </code>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-600 dark:text-gray-400 w-16">Password:</span>
                <code class="flex-1 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 font-mono">
                  password
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Footer -->
    <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
      © {{ new Date().getFullYear() }} Hafalan App. All rights reserved.
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: 'auth'
})

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const loading = ref(false)

const isFormValid = computed(() => {
  return form.email && form.password
})

async function handleLogin() {
  if (!isFormValid.value) return
  
  loading.value = true
  
  const result = await authStore.login(form.email, form.password)
  
  loading.value = false
  
  if (result.success) {
    toast.add({
      title: 'Login Successful',
      description: 'Welcome back!',
      color: 'success',
    })
    
    router.push('/dashboard')
  } else {
    toast.add({
      title: 'Login Failed',
      description: result.message || 'Invalid credentials',
      color: 'error',
    })
  }
}

function handleForgotPassword() {
  toast.add({
    title: 'Coming Soon',
    description: 'Password reset feature will be available soon',
    color: 'info',
  })
}
</script>
