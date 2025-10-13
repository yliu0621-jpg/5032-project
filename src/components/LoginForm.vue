<template>
  <div class="card">
    <h4 class="card-header text-bg-primary text-center">
      Login
    </h4>
    <form class="card-body" @submit.prevent="handleLogin">
      <label for="email" class="form-label">
        Email
      </label>
      <input id="email" type="email" class="form-control" v-model="formData.email" required>
      </input>
      <label for="password" class="form-label">
        Password
      </label>
      <input id="password" type="password" class="form-control" v-model="formData.password" required>
      </input>
      <button type="submit" class="btn btn-primary mt-3 w-100">
        Login
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase';
import { toast } from '@/utils/toast';
const router = useRouter();
const formData = ref({
  email: '',
  password: '',
});
const handleLogin = () => {
  signInWithEmailAndPassword(auth, formData.value.email, formData.value.password)
    .then((data) => {
      toast.success("Login successful!")
      router.push({
        name: 'home',
      });
    }).catch((error) => {
      toast.error("Login failed!")
      console.error(error.code, error)
    })
}
</script>
