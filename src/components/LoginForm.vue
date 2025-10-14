<template>
  <div class="card">
    <h4 class="card-header bg-primary text-white text-center">
      Login
    </h4>

    <!-- Success Messages -->
    <div v-if="showRegistrationSuccess" class="alert alert-success" role="alert">
      <strong>Registration Successful!</strong><br>
      <small>Please check your email and verify your account before logging in.</small>
    </div>

    <!-- Email Verification Required Alert -->
    <div v-if="showVerificationRequired" class="alert alert-warning" role="alert">
      <strong>Email Verification Required</strong><br>
      <small>Please verify your email address before logging in.</small>
    </div>

    <form class="card-body" @submit.prevent="handleLogin">
      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          type="email"
          class="form-control"
          v-model="formData.email"
          placeholder="Enter your email"
          required
        />
        <div class="form-text" v-if="errors.email">
          <small class="text-danger">{{ errors.email }}</small>
        </div>
      </div>

      <!-- Password -->
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input
          id="password"
          type="password"
          class="form-control"
          v-model="formData.password"
          placeholder="Enter your password"
          required
        />
        <div class="form-text" v-if="errors.password">
          <small class="text-danger">{{ errors.password }}</small>
        </div>
      </div>

      <!-- Remember Me -->
      <div class="mb-3">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="remember" v-model="formData.remember">
          <label class="form-check-label" for="remember">
            Remember me
          </label>
        </div>
      </div>

      <!-- Login Button -->
      <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="isSubmitting">
        <span v-if="isSubmitting">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Signing In...
        </span>
        <span v-else>Login</span>
      </button>

      <!-- Register Link -->
      <div class="text-center">
        <p class="mb-0">Don't have an account?
          <router-link to="/register" class="text-primary">Sign Up</router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase';
import { toast } from '@/utils/toast';

const router = useRouter();
const route = useRoute();

// Form data
const formData = ref({
  email: '',
  password: '',
  remember: false,
});

// Form state
const isSubmitting = ref(false);
const errors = ref({});
const showRegistrationSuccess = ref(false);
const showVerificationRequired = ref(false);

// Check for registration success message on mount
onMounted(() => {
  if (route.query.message === 'registration-success' && route.query.email) {
    showRegistrationSuccess.value = true;
    formData.value.email = route.query.email;

    // Clean the URL
    router.replace({ query: {} });
  }
});

// Validate form
const validateForm = () => {
  errors.value = {};

  const { email, password } = formData.value;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.value.email = 'Please enter a valid email address';
  }

  // Password validation
  if (password.length < 1) {
    errors.value.password = 'Password is required';
  }

  return Object.keys(errors.value).length === 0;
};

// Handle login
const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      formData.value.email,
      formData.value.password
    );

    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      showVerificationRequired.value = true;
      await auth.signOut(); // Sign out the user
      toast.warning('Please verify your email before logging in.');
      return;
    }

    toast.success('Login successful!');
    router.push({ name: 'home' });

  } catch (error) {
    console.error('Login error:', error);

    let errorMessage = 'Login failed. Please check your credentials and try again.';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    toast.error(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
