import { sendEmailVerification } from 'firebase/auth'
import { auth } from '@/firebase'
import { toast } from '@/utils/toast'

// Send email verification to the current authenticated user
export const sendVerificationEmail = async () => {
  const user = auth.currentUser

  if (!user) {
    toast.error('No user is currently signed in')
    return false
  }

  if (user.emailVerified) {
    toast.info('Email is already verified')
    return true
  }

  try {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/login?verified=true`,
      handleCodeInApp: true
    })

    toast.success(
      `Verification email sent to ${user.email}. Please check your inbox.`,
      { delay: 5000 }
    )

    return true
  } catch (error) {
    console.error('Error sending verification email:', error)

    let errorMessage = 'Failed to send verification email'

    switch (error.code) {
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please wait a moment and try again.'
        break
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.'
        break
      default:
        errorMessage = error.message || errorMessage
    }

    toast.error(errorMessage)
    return false
  }
}

// Check if current user's email is verified
export const isEmailVerified = () => {
  const user = auth.currentUser
  return user ? user.emailVerified : null
}

// Get current user's email
export const getCurrentUserEmail = () => {
  const user = auth.currentUser
  return user ? user.email : null
}
