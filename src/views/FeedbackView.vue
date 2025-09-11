<template>
	<div id="app" class="container mt-5">
		<h1 class="mb-4">Feedback</h1>

		<div class="card mb-4">
			<form @submit.prevent="handleSubmit">
				<div class="card-header">
					<div>
						<Rating v-model="rating" />
						<span class="ms-3">Rating: <strong>{{ rating }}</strong></span>
					</div>
				</div>
				<div class="card-body d-flex flex-column">
					<div class="form-floating mt-3">
						<textarea class="form-control" placeholder="Leave a comment here" id="floatingTextarea"
							style="height: 200px" v-model="comment"></textarea>
						<label for="floatingTextarea">Comments</label>
					</div>
					<button class="btn btn-primary mx-auto mt-3">Submit</button>
				</div>
			</form>
		</div>

	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Rating from '@/components/Rating.vue'
import { auth, db } from '@/firebase'
import { addDoc, collection, getDocs } from 'firebase/firestore'

const rating = ref(5)
const comment = ref('')
const feedbackList = ref([])

onMounted(() => {
	getDocs(collection(db, 'feedback'))
		.then(snapshot => snapshot.forEach(
			doc => feedbackList.value.push(doc.data())
		))
})

function handleSubmit() {
	addDoc(collection(db, 'feedback'), {
		email: auth.currentUser.email,
		rating: rating.value,
		comment: comment.value
	}).then(() => {
		console.log('success');
	}).catch((error) => {
		console.error(error);
	})
}
</script>

<style></style>
