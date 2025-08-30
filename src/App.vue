<script setup>
import RegisterForm from './components/RegisterForm.vue';
</script>

<template>
  <main class="container">
    <div class="my-5 row justify-content-center">
      <div class="row justify-content-center">
        <div class="col col-md-7 col-lg-5">
          <RegisterForm />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
