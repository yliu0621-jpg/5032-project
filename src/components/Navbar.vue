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
					<li class="nav-item">
						<span class="nav-link text-body-tertiary">{{ isOnline ? '🟢 Online' : '🔴 Offline' }}</span>
					</li>
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
						<router-link class="nav-link" active-class="active" to="/profile">Profile</router-link>
					</li>
					<li v-if="userRole !== ''" class="nav-item">
						<router-link class="nav-link" active-class="active" to="/feedback">Feedback</router-link>
					</li>
					<li v-if="userRole === 'user'" class="nav-item">
						<router-link class="nav-link" active-class="active" to="/meal-management">Meal Management</router-link>
					</li>
					<li v-if="userRole === 'admin'" class="nav-item">
						<router-link class="nav-link active" active-class="active" to="/admin">
							<i class="bi bi-shield-gear me-1"></i>
							Admin Dashboard
						</router-link>
					</li>
				</ul>
			</div>
		</div>
	</nav>
</template>

<script setup>
import { auth, getUserName, getUserRole } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { onMounted, onUnmounted, ref } from 'vue';

const userRole = ref('')
const isOnline = ref(navigator.onLine)

// Update network status
const updateOnlineStatus = () => {
	isOnline.value = navigator.onLine
}

onMounted(() => {
	// Listen for auth changes
	onAuthStateChanged(auth, (user) => {
		userRole.value = getUserRole(user);
	});

	// Listen for network status changes
	window.addEventListener('online', updateOnlineStatus)
	window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
	// Clean up event listeners
	window.removeEventListener('online', updateOnlineStatus)
	window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped></style>
