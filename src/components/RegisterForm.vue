<template>
  <div class="card">
    <h4 class="card-header bg-primary text-white text-center">
      Sign Up
    </h4>
    <form class="card-body" @submit.prevent="handleRegister">
      <!-- Username -->
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input class="form-control" type="text" id="username" v-model="formData.username"
          placeholder="Enter your username" required />
        <div class="form-text" v-if="errors.username">
          <small class="text-danger">{{ errors.username }}</small>
        </div>
      </div>

      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input id="email" type="email" class="form-control" v-model="formData.email" placeholder="Enter your email"
          required />
        <div class="form-text" v-if="errors.email">
          <small class="text-danger">{{ errors.email }}</small>
        </div>
      </div>

      <!-- Password -->
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input id="password" type="password" class="form-control" v-model="formData.password"
          placeholder="Enter your password" required />
        <div class="form-text" v-if="errors.password">
          <small class="text-danger">{{ errors.password }}</small>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="mb-3">
        <label for="confirm-password" class="form-label">Confirm Password</label>
        <input id="confirm-password" type="password" class="form-control" v-model="formData.confirmPassword"
          placeholder="Confirm your password" required />
        <div class="form-text" v-if="errors.confirmPassword">
          <small class="text-danger">{{ errors.confirmPassword }}</small>
        </div>
      </div>

      <!-- Role -->
      <div class="mb-3">
        <label for="role" class="form-label">User Role</label>
        <select id="role" class="form-select" v-model="formData.role" required>
          <option value="user">User</option>
          <option value="nutritionist">Nutritionist</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <!-- Terms and Conditions -->
      <div class="mb-3">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="terms" v-model="formData.terms" required>
          <label class="form-check-label" for="terms">
            I agree to the Terms and Conditions
          </label>
        </div>
        <div class="form-text" v-if="errors.terms">
          <small class="text-danger">{{ errors.terms }}</small>
        </div>
      </div>

      <!-- Register Button -->
      <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
        <span v-if="isSubmitting">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Creating Account...
        </span>
        <span v-else>Register</span>
      </button>

      <!-- Login Link -->
      <div class="text-center mt-3">
        <p class="mb-0">Already have an account?
          <router-link to="/login" class="text-primary">Sign In</router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase';
import { toast } from '@/utils/toast';

const router = useRouter();

// Form data
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  terms: false,
});

// Form state
const isSubmitting = ref(false);
const errors = ref({});

// Validate form
const validateForm = () => {
  errors.value = {};

  const { username, email, password, confirmPassword, terms } = formData.value;

  // Username validation
  if (username.length < 3 || username.length > 15) {
    errors.value.username = 'Username must be between 3 and 15 characters';
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.value.email = 'Please enter a valid email address';
  }

  // Password validation
  if (password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
  }

  // Confirm password validation
  if (password !== confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match';
  }

  // Terms validation
  if (!terms) {
    errors.value.terms = 'You must agree to the terms and conditions';
  }

  return Object.keys(errors.value).length === 0;
};

// Save user data to Firestore
const saveUserToFirestore = async (user, username, role) => {
  const userData = {
    uid: user.uid,
    username: username,
    email: user.email,
    role: role,
    displayName: `${username}:${role}`,
    emailVerified: user.emailVerified,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    isActive: true
  };

  try {
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('User data saved to Firestore');
  } catch (error) {
    console.error('Error saving user data to Firestore:', error);
    throw error;
  }
};

// Handle registration
const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  const { email, password, username, role } = formData.value;

  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: `${username}:${role}`
    });

    // Save user data to Firestore
    await saveUserToFirestore(user, username, role);

    // Send email verification
    await sendEmailVerification(user);

    // Show success message
    toast.success(
      'Registration successful! Please check your email to verify your account.',
      { delay: 5000 }
    );

    // Redirect to email verification page
    router.push({
      name: 'verify-email'
    });

  } catch (error) {
    console.error('Registration error:', error);

    let errorMessage = 'Registration failed. Please try again.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak.';
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
