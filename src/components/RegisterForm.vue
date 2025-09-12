<template>
  <div class="card">
    <h4 class="card-header text-bg-primary text-center">
      Sign Up
    </h4>
    <form class="card-body" @submit.prevent="handleRegister">
      <label for="username" class="form-label">Username</label>
      <input class="form-control" type="text" id="username" v-model="formData.username" required />

      <label for="email" class="form-label">Email</label>
      <input id="email" type="email" class="form-control" v-model="formData.email" required />

      <label for="password" class="form-label">Password</label>
      <input id="password" type="password" class="form-control" v-model="formData.password" required />

      <label for="confirm-password" class="form-label">Confirm Password</label>
      <input id="confirm-password" type="password" class="form-control" v-model="formData.confirmPassword" required />

      <label for="role" class="form-label">User Role</label>
      <select id="role" class="form-select" v-model="formData.role" required>
        <option selected value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" class="btn btn-primary mt-3 w-100">
        Register
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/firebase';
const router = useRouter();
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
});
const handleRegister = () => {
  const { email, password, username, confirmPassword, role } = formData.value;
  // validate form data
  const usernameLen = username.length;
  if (usernameLen < 3 || usernameLen > 15) {
    alert('Username must be between 3 and 15 characters');
    return;
  }
  const passwordLen = password.length;
  if (passwordLen < 6 || passwordLen > 20) {
    alert('Password must be between 6 and 20 characters');
    return;
  }
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCred) => updateProfile(userCred.user, {
      displayName: `${username}:${role}`
    }))
    .then(() => router.push({
      name: 'display-data',
      query: { ...formData.value }
    }))
    .catch((error) => {
      console.error(error.code, error)
    })
}
</script>
