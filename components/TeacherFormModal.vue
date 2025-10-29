<template>
  <USlideover v-model="isOpen" title="Teacher Form">
    <div class="space-y-6">
      <!-- NIP Display (Read-only for new teachers) -->
      <div v-if="isEditing" class="space-y-2">
        <label class="block text-sm font-medium">NIP</label>
        <p class="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
          {{ form.nip }}
        </p>
      </div>

      <!-- Name -->
      <UFormGroup label="Name" name="name" required>
        <UInput
          v-model="form.name"
          placeholder="Enter teacher name"
          required
        />
      </UFormGroup>

      <!-- Email -->
      <UFormGroup label="Email" name="email" required>
        <UInput
          v-model="form.email"
          type="email"
          placeholder="Enter email address"
          required
        />
      </UFormGroup>

      <!-- Phone -->
      <UFormGroup label="Phone" name="phone">
        <UInput
          v-model="form.phone"
          placeholder="Enter phone number"
        />
      </UFormGroup>

      <!-- Gender -->
      <UFormGroup label="Gender" name="gender">
        <USelect
          v-model="form.gender"
          :options="[
            { label: 'Male', value: 'L' },
            { label: 'Female', value: 'P' }
          ]"
          placeholder="Select gender"
        />
      </UFormGroup>

      <!-- Birth Date -->
      <UFormGroup label="Birth Date" name="birthDate">
        <UInput
          v-model="form.birthDate"
          type="date"
        />
      </UFormGroup>

      <!-- Birth Place -->
      <UFormGroup label="Birth Place" name="birthPlace">
        <UInput
          v-model="form.birthPlace"
          placeholder="Enter birth place"
        />
      </UFormGroup>

      <!-- Address -->
      <UFormGroup label="Address" name="address">
        <UTextarea
          v-model="form.address"
          placeholder="Enter address"
        />
      </UFormGroup>

      <!-- Classes -->
      <UFormGroup label="Assign Classes" name="classIds">
        <div class="space-y-2">
          <div v-if="availableClasses.length === 0" class="text-sm text-gray-500">
            No classes available
          </div>
          <div v-else class="space-y-2">
            <label
              v-for="cls in availableClasses"
              :key="cls.id"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :value="cls.id"
                v-model.number="form.classIds"
                class="rounded border-gray-300"
              />
              <span class="text-sm">{{ cls.name }}</span>
            </label>
          </div>
        </div>
      </UFormGroup>

      <!-- Default Password Notice (New Teacher) -->
      <div v-if="!isEditing" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>Default password:</strong> teacher123
        </p>
        <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">
          The teacher will be prompted to change this password on first login.
        </p>
      </div>

      <!-- Form Actions -->
      <div class="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <UButton
          variant="ghost"
          @click="isOpen = false"
        >
          Cancel
        </UButton>
        <UButton
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Update Teacher' : 'Create Teacher' }}
        </UButton>
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts" generic="T">
import { ref, watch, computed } from 'vue'

interface Teacher {
  id?: number
  nip?: string
  name: string
  email: string
  phone?: string
  gender?: string
  birthDate?: string
  birthPlace?: string
  address?: string
  classes?: string[]
}

interface Class {
  id: number
  name: string
}

interface Props {
  modelValue: boolean
  teacher?: Teacher | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submitted'): void
}

const props = withDefaults(defineProps<Props>(), {
  teacher: null
})

const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const submitting = ref(false)
const availableClasses = ref<Class[]>([])

const form = ref<Teacher & { classIds: number[] }>({
  name: '',
  email: '',
  phone: '',
  gender: '',
  birthDate: '',
  birthPlace: '',
  address: '',
  classIds: []
})

const isEditing = computed(() => !!props.teacher?.id)

// Fetch available classes
const fetchClasses = async () => {
  try {
    const classes = await $fetch('/api/classes') as any
    availableClasses.value = Array.isArray(classes) ? classes : classes.data || []
  } catch (error) {
    console.error('Error fetching classes:', error)
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    classIds: []
  }
}

// Handle submit
const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone || null,
      gender: form.value.gender || null,
      birthDate: form.value.birthDate || null,
      birthPlace: form.value.birthPlace || null,
      address: form.value.address || null,
      classIds: form.value.classIds
    }

    if (isEditing.value && props.teacher?.id) {
      // Update
      await $fetch(`/api/teachers/${props.teacher.id}`, {
        method: 'PUT',
        body: payload
      })
      useToast().add({
        title: 'Success',
        description: 'Teacher updated successfully',
        color: 'success'
      })
    } else {
      // Create
      await $fetch('/api/teachers', {
        method: 'POST',
        body: payload
      })
      useToast().add({
        title: 'Success',
        description: 'Teacher created successfully',
        color: 'success'
      })
    }

    isOpen.value = false
    emit('submitted')
  } catch (error: any) {
    console.error('Error submitting form:', error)
    useToast().add({
      title: 'Error',
      description: error.data?.message || 'Failed to submit form',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

// Watch for teacher prop changes
watch(() => props.teacher, (newTeacher) => {
  if (newTeacher) {
    form.value = {
      ...newTeacher,
      classIds: (newTeacher.classes || []).map((_, i) => i) // Placeholder - should be actual class IDs
    }
  } else {
    resetForm()
  }
}, { deep: true })

// Watch for modal open
watch(() => isOpen.value, async (value) => {
  if (value) {
    await fetchClasses()
    if (!props.teacher) {
      resetForm()
    }
  }
})
</script>
