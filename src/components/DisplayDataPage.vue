<template>
  <div class="card">
    <h4 class="card-header text-bg-success text-center">
      Register Success!
    </h4>
    <div class="card-body">
      <p><strong>Username:</strong> {{ userData.username }}</p>
      <p><strong>Email:</strong> {{ userData.email }}</p>
      <p><strong>Password (For Demo Only):</strong> {{ userData.password }}</p>
      <p><strong>Confirm Password (For Demo Only):</strong> {{ userData.confirm }}</p>

      <router-link to="/" class="btn btn-secondary mt-3">
        Back to Register Page
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const userData = computed(() => {
  return {
    username: route.query.username || 'N/A',
    email: route.query.email || 'N/A',
    password: route.query.password || 'N/A',
    confirm: route.query.confirm || 'N/A',
  };
});
</script>

<style scoped></style>
