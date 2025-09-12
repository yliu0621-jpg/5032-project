<template>
	<div id="app" class="container mt-5">
		<h1 class="mb-4">Feedback</h1>

		<div class="card mb-4" v-if="userRole === 'user'">
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
		<div v-if="userRole === 'user'">
			<h2>Your feedback</h2>
		</div>
		<p>Average Rating: {{
			(feedbackList.reduce((acc, item) => acc + item.rating, 0) / feedbackList.length).toFixed(2)
		}}</p>
		<table class="table">
			<thead>
				<tr>
					<th scope="col">#</th>
					<th scope="col">Username</th>
					<th scope="col">Comment</th>
					<th scope="col">Rating</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(feedback, index) in feedbackList" :key="index">
					<th scope="row">{{ index + 1 }}</th>
					<td>{{ feedback.username }}</td>
					<td>{{ feedback.comment }}</td>
					<td>
						<Rating v-model="feedback.rating" :read-only="true" />
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Rating from '@/components/Rating.vue'
import { auth, db, getUserName, getUserRole } from '@/firebase'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const rating = ref(5)
const comment = ref('')

const feedbackList = ref([])
const userRole = ref('')

onMounted(() => {
	onAuthStateChanged(auth, (user) => {
		userRole.value = getUserRole(user);
		feedbackList.value = []
		getDocs(collection(db, 'feedback')).then(snapshot => snapshot.forEach(doc => {
			const feedback = doc.data();
			if (userRole.value === 'admin' || feedback.uid === auth.currentUser.uid) {
				feedbackList.value.push(feedback);
			}
		}))
	});
})

function handleSubmit() {
	const feedback = {
		username: getUserName(),
		uid: auth.currentUser.uid,
		rating: rating.value,
		comment: comment.value
	}
	addDoc(collection(db, 'feedback'), feedback)
		.then(() => {
			alert('Feedback submitted!')
			comment.value = ''
			feedbackList.value.push(feedback)
		}).catch((error) => {
			console.error(error);
		})
}
</script>

<style></style>
