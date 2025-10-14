<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-primary text-white text-center">
            <h4 class="mb-0">Email Verification</h4>
          </div>

          <div class="card-body">
            <!-- Success state -->
            <div v-if="isVerified" class="text-center py-4">
              <div class="mb-4">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
              </div>
              <h5 class="text-success mb-3">Email Verified Successfully!</h5>
              <p class="text-muted mb-4">
                Your email has been verified. You can now log in to your account.
              </p>
              <router-link to="/login" class="btn btn-primary">
                Continue to Login
              </router-link>
            </div>

            <!-- Verification needed state -->
            <div v-else class="text-center py-4">
              <div class="mb-4">
                <i class="bi bi-envelope text-primary" style="font-size: 3rem;"></i>
              </div>
              <h5 class="mb-3">Verify Your Email Address</h5>
              <p class="text-muted mb-4">
                We've sent a verification email to:
              </p>
              <div class="alert alert-info">
                <strong>{{ userEmail }}</strong>
              </div>
              <p class="text-muted">
                Please check your inbox and click the verification link to complete your registration.
              </p>

              <!-- Resend verification button -->
              <div class="mb-3">
                <p class="text-muted small">
                  Didn't receive the email? Check your spam folder or resend the verification email.
                </p>
                <button
                  class="btn btn-outline-primary"
                  @click="resendVerificationEmail"
                  :disabled="isResending"
                >
                  <span v-if="isResending">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Sending...
                  </span>
                  <span v-else>Resend Verification Email</span>
                </button>
              </div>

              <!-- Back to login -->
              <div>
                <router-link to="/login" class="btn btn-secondary">
                  Back to Login
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
import { ref, onMounted, onUnmounted } from 'vue'
import { auth } from '@/firebase'
import { sendVerificationEmail } from '@/utils/emailVerification'
import { toast } from '@/utils/toast'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// State
const isVerified = ref(false)
const isResending = ref(false)
const userEmail = ref('')
let checkInterval = null

// Check email verification status
const checkVerificationStatus = () => {
  const user = auth.currentUser
  if (user) {
    user.reload().then(() => {
      if (user.emailVerified) {
        isVerified.value = true
        if (checkInterval) {
          clearInterval(checkInterval)
          checkInterval = null
        }
        toast.success('Email successfully verified!')
      }
    }).catch(error => {
      console.error('Error reloading user:', error)
    })
  }
}

// Resend verification email
const resendVerificationEmail = async () => {
  isResending.value = true
  try {
    await sendVerificationEmail()
  } finally {
    isResending.value = false
  }
}

onMounted(() => {
  const user = auth.currentUser

  if (!user) {
    // No user is signed in, redirect to login
    router.push('/login')
    return
  }

  userEmail.value = user.email

  // Check initial verification status
  if (user.emailVerified) {
    isVerified.value = true
  } else {
    // Check if URL contains verified parameter
    if (route.query.verified === 'true') {
      // Reload user to get latest verification status
      user.reload().then(() => {
        if (user.emailVerified) {
          isVerified.value = true
          toast.success('Email successfully verified!')
        }
      })
    }

    // Set up periodic check for verification status
    checkInterval = setInterval(checkVerificationStatus, 5000) // Check every 5 seconds
  }
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>