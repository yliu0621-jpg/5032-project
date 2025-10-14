<template>
	<nav class="navbar navbar-expand-sm bg-primary-subtle">
		<div class="container">
			<router-link class="navbar-brand" to="/">MealPlan Hub</router-link>

			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
				aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>

			<div class="collapse navbar-collapse" id="navbarNav">
				<ul class="navbar-nav ms-auto">
					<li v-if="userRole === ''" class="nav-item">
						<router-link class="nav-link" active-class="active" to="/login">Login</router-link>
					</li>
					<li v-if="userRole === ''" class="nav-item">
						<router-link class="nav-link" active-class="active" to="/register">Register</router-link>
					</li>
					<li v-if="userRole !== ''" class="nav-item">
						<span class="nav-link text-body-tertiary">{{ getUserName() }}</span>
					</li>
					<li v-if="userRole !== ''" class="nav-item">
						<router-link class="nav-link" active-class="active" to="/logout">Logout</router-link>
					</li>
					<li v-if="userRole !== ''" class="nav-item">
						<router-link class="nav-link" active-class="active" to="/feedback">Feedback</router-link>
					</li>
					<li v-if="userRole === 'user'" class="nav-item">
						<router-link class="nav-link" active-class="active" to="/meal-management">Meal Management</router-link>
					</li>
					<!-- <li v-if="userRole === 'admin'" class="nav-item">
						<router-link class="nav-link" active-class="active" to="/dashboard">Dashboard</router-link>
					</li> -->
				</ul>
			</div>
		</div>
	</nav>
</template>

<script setup>
import { auth, getUserName, getUserRole } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { onMounted, ref } from 'vue';

const userRole = ref('')
onMounted(() => {
	onAuthStateChanged(auth, (user) => {
		userRole.value = getUserRole(user);
	});
})
</script>

<style scoped></style>
