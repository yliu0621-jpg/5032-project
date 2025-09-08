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
        Register
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
const router = useRouter();
const formData = ref({
  email: '',
  password: '',
});
const auth = getAuth()
const handleLogin = () => {
  signInWithEmailAndPassword(auth, formData.value.email, formData.value.password)
    .then((data) => {
      console.log("Login Successful");
      router.push({
        name: 'display-data',
        query: { ...formData.value }
      });
    }).catch((error) => {
      console.error(error.code, error)
    })
}
</script>
