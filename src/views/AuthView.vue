<template>
	<div class="my-5 row justify-content-center">
		<div class="row justify-content-center">
			<div class="col col-md-7 col-lg-5">
				<LoginForm v-if="formType === 'login'" />
				<RegisterForm v-else />
			</div>
		</div>
	</div>
</template>
<script setup>
import LoginForm from '@/components/LoginForm.vue';
import RegisterForm from '@/components/RegisterForm.vue';
const props = defineProps({
	formType: String
})
</script>
