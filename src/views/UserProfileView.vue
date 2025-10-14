<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h2 class="text-center mb-4">User Profile</h2>

        <!-- User Information Card -->
        <div class="card mb-4">
          <div class="card-header">
            <h4 class="mb-0">User Information</h4>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            <div v-else-if="user">
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Email:</strong> {{ user.email }}</p>
                  <p><strong>User ID:</strong> {{ user.uid }}</p>
                  <p><strong>Email Verified:</strong>
                    <span class="badge" :class="user.emailVerified ? 'bg-success' : 'bg-warning'">
                      {{ user.emailVerified ? 'Verified' : 'Not Verified' }}
                    </span>
                  </p>
                </div>
                <div class="col-md-6">
                  <p><strong>Display Name:</strong> {{ user.displayName || 'Not set' }}</p>
                  <p><strong>Account Created:</strong> {{ formatDate(user.metadata.creationTime) }}</p>
                  <p><strong>Last Sign In:</strong> {{ formatDate(user.metadata.lastSignInTime) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Data Card -->
        <div class="card">
          <div class="card-header">
            <h4 class="mb-0">Export Data</h4>
          </div>
          <div class="card-body">
            <p class="mb-3">Export all your data (meal plans, ingredients, feedback) via email.</p>

            <div class="alert alert-info">
              <strong>What you'll receive:</strong>
              <ul class="mb-0 mt-2">
                <li>Meal Plans CSV file</li>
                <li>Ingredients CSV file</li>
                <li>Feedback CSV file</li>
                <li>Summary statistics</li>
              </ul>
            </div>

            <div v-if="!user?.emailVerified" class="alert alert-warning mb-3">
              <strong>Warning:</strong> Please verify your email address before exporting data.
              <router-link to="/verify-email" class="alert-link">Verify Email</router-link>
            </div>

            <button class="btn btn-primary" @click="exportAllData" :disabled="isExporting || !user?.emailVerified">
              <span v-if="isExporting">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Exporting...
              </span>
              <span v-else>
                <i class="bi bi-download me-2"></i>
                Export All Data
              </span>
            </button>

            <div v-if="exportStatus" class="mt-3">
              <div class="alert" :class="exportStatus.type">
                {{ exportStatus.message }}
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="card mt-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-2">
                <router-link to="/meal-management" class="btn btn-outline-primary w-100">
                  <i class="bi bi-utensils me-2"></i>
                  Meal Management
                </router-link>
              </div>
              <div class="col-md-6 mb-2">
                <router-link to="/feedback" class="btn btn-outline-info w-100">
                  <i class="bi bi-chat-dots me-2"></i>
                  Feedback
                </router-link>
              </div>
              <div class="col-md-6 mb-2">
                <button class="btn btn-outline-secondary w-100" @click="refreshData">
                  <i class="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
              </div>
              <div class="col-md-6 mb-2">
                <router-link to="/logout" class="btn btn-outline-danger w-100">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  Sign Out
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth, functions } from '@/firebase'
import { httpsCallable } from 'firebase/functions'
import { toast } from '@/utils/toast'

// Reactive state
const loading = ref(true)
const error = ref('')
const user = ref(null)
const isExporting = ref(false)
const exportStatus = ref(null)

// Functions instance imported from firebase.js

// Methods
const loadUserInfo = async () => {
  try {
    loading.value = true
    error.value = ''

    const currentUser = auth.currentUser
    if (!currentUser) {
      error.value = 'No user is currently logged in'
      return
    }

    user.value = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      emailVerified: currentUser.emailVerified,
      metadata: {
        creationTime: currentUser.metadata.creationTime,
        lastSignInTime: currentUser.metadata.lastSignInTime
      }
    }

  } catch (err) {
    console.error('Error loading user info:', err)
    error.value = 'Failed to load user information'
  } finally {
    loading.value = false
  }
}

const exportAllData = async () => {
  if (!user.value?.emailVerified) {
    toast.warning('Please verify your email address before exporting data.')
    return
  }

  try {
    isExporting.value = true
    exportStatus.value = null

    const exportUserData = httpsCallable(functions, 'exportUserData')
    const result = await exportUserData()

    if (result.data.success) {
      exportStatus.value = {
        type: 'alert-success',
        message: 'Your data export has been sent to your email!'
      }
      toast.success('Export completed successfully!')
    } else {
      throw new Error(result.data.message || 'Export failed')
    }

  } catch (err) {
    console.error('Error exporting data:', err)
    exportStatus.value = {
      type: 'alert-danger',
      message: 'Failed to export data. Please try again.'
    }
    toast.error('Export failed. Please try again.')
  } finally {
    isExporting.value = false
  }
}

const refreshData = () => {
  exportStatus.value = null
  loadUserInfo()
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (err) {
    return 'Invalid date'
  }
}

// Lifecycle
onMounted(() => {
  loadUserInfo()

  const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    if (currentUser) {
      loadUserInfo()
    } else {
      user.value = null
      loading.value = false
    }
  })

  return () => unsubscribe()
})
</script>
