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
						<router-link class="nav-link" active-class="active" to="/login">Login</router-link>
					</li>
					<li class="nav-item">
						<router-link class="nav-link" active-class="active" to="/register">Register</router-link>
					</li>
				</ul>
			</div>
		</div>
	</nav>
</template>

<script setup>
</script>

<style scoped>
</style>
