<template>
  <UCard>
    <!-- Header -->
    <template #header>
      <div class="text-center">
        <div class="flex justify-center mb-4">
          <UIcon name="i-heroicons-book-open" class="w-12 h-12 text-primary-500" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Hafalan App
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sistem Manajemen Hafalan Al-Quran
        </p>
      </div>
    </template>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="space-y-6">
      <UFormGroup label="Email" name="email" required>
        <UInput
          v-model="form.email"
          type="email"
          placeholder="admin@example.com"
          icon="i-heroicons-envelope"
          :disabled="loading"
          autocomplete="email"
        />
      </UFormGroup>

      <UFormGroup label="Password" name="password" required>
        <UInput
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          icon="i-heroicons-lock-closed"
          :disabled="loading"
          autocomplete="current-password"
        />
      </UFormGroup>

      <div class="flex items-center justify-between">
        <UCheckbox v-model="form.remember" label="Remember me" />
        <UButton
          variant="link"
          color="primary"
          size="sm"
          :padded="false"
          @click="handleForgotPassword"
        >
          Forgot password?
        </UButton>
      </div>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        :disabled="!isFormValid"
      >
        Sign In
      </UButton>
    </form>

    <!-- Default Credentials Info -->
    <template #footer>
      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p class="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🔐 Default Login:
        </p>
        <p class="text-xs text-blue-800 dark:text-blue-200">
          Email: <code class="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">admin@example.com</code>
        </p>
        <p class="text-xs text-blue-800 dark:text-blue-200">
          Password: <code class="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">password</code>
        </p>
      </div>
    </template>
  </UCard>
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
      color: 'green',
    })
    
    router.push('/dashboard')
  } else {
    toast.add({
      title: 'Login Failed',
      description: result.message || 'Invalid credentials',
      color: 'red',
    })
  }
}

function handleForgotPassword() {
  toast.add({
    title: 'Coming Soon',
    description: 'Password reset feature will be available soon',
    color: 'blue',
  })
}
</script>
