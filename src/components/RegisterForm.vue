<template>
	<div class="card">
		<h4 class="card-header text-bg-primary text-center">
			Sign Up
		</h4>
		<form class="card-body" @submit.prevent="handleRegister">
			<label for="username" class="form-label">
				Username
			</label>
			<input class="form-control" type="text" id="username" v-model="formData.username" required>
			</input>
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
			<label for="conform-password" class="form-label">
				Confirm Password
			</label>
			<input id="conform-password" type="password" class="form-control" v-model="formData.confirm" required>
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
const formData = ref({
	username: '',
	email: '',
	password: '',
	confirm: ''
});
const handleRegister = () => {
	// validate form data
	const usernameLen = formData.value.username.length;
	if (usernameLen < 3 || usernameLen > 15) {
		alert('Username must be between 3 and 15 characters');
		return;
	}
	const passwordLen = formData.value.password.length;
	if (passwordLen < 6 || passwordLen > 20) {
		alert('Password must be between 6 and 20 characters');
		return;
	}
	if (formData.value.password !== formData.value.confirm) {
		alert('Passwords do not match');
		return;
	}
}
</script>
