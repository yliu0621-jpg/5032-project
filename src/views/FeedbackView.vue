<template>
	<div id="app" class="container mt-5">
		<h1 class="mb-4">Feedback</h1>

		<div class="card mb-4" v-if="userRole === 'user'">
			<form @submit.prevent="handleSubmit">
				<div class="card-header">
					<div>
						<Rating v-model="rating" @update:modelValue="autoSaveDraft" />
						<span class="ms-3">Rating: <strong>{{ rating }}</strong></span>
					</div>
				</div>
				<div class="card-body d-flex flex-column">
					<div class="form-floating mt-3">
						<textarea class="form-control" placeholder="Leave a comment here" id="floatingTextarea"
							style="height: 200px" v-model="comment" @input="autoSaveDraft"></textarea>
						<label for="floatingTextarea">Comments</label>
					</div>
					<div class="d-flex justify-content-between align-items-center mt-3">
						<div>
							<button type="button" class="btn btn-outline-secondary btn-sm me-2"
								@click="saveCurrentDraft">
								<i class="bi bi-save me-1"></i>
								Save Draft
							</button>
							<button type="button" class="btn btn-outline-danger btn-sm" @click="clearCurrentDraft"
								v-if="hasDraftData">
								<i class="bi bi-trash me-1"></i>
								Clear Draft
							</button>
						</div>
						<div>
							<button class="btn btn-primary" type="submit">Submit</button>
						</div>
					</div>
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
import { onMounted, onUnmounted, ref } from 'vue'
import Rating from '@/components/Rating.vue'
import { auth, db, getUserName, getUserRole } from '@/firebase'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { saveDraft, getDraft, clearDraft } from '@/utils/draftStorage.js'
import { toast } from '@/utils/toast.js'

const rating = ref(5)
const comment = ref('')

const feedbackList = ref([])
const userRole = ref('')

// Draft related state
const hasDraftData = ref(false)
let autoSaveTimer = null

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

		// Load draft if user is logged in
		if (user) {
			loadDraft()
		}
	});
})

onUnmounted(() => {
	// Clean up timers and event listeners
	if (autoSaveTimer) {
		clearTimeout(autoSaveTimer)
	}
})

// Draft functions
const loadDraft = () => {
	const draft = getDraft()
	if (draft) {
		rating.value = draft.rating || 5
		comment.value = draft.comment || ''
		hasDraftData.value = true
		toast.info('Draft loaded successfully')
	} else {
		hasDraftData.value = false
	}
}

const saveCurrentDraft = () => {
	if (rating.value || comment.value) {
		saveDraft({
			rating: rating.value,
			comment: comment.value
		})
		hasDraftData.value = true
		toast.success('Draft saved manually!')
	} else {
		toast.warning('Nothing to save!')
	}
}

const clearCurrentDraft = () => {
	if (confirm('Are you sure you want to clear the draft?')) {
		clearDraft()
		hasDraftData.value = false
		toast.info('Draft cleared!')
	}
}

const autoSaveDraft = () => {
	// Clear existing timer
	if (autoSaveTimer) {
		clearTimeout(autoSaveTimer)
	}

	// Set new timer to save after 2 seconds of inactivity
	autoSaveTimer = setTimeout(() => {
		saveCurrentDraft()
	}, 2000)
}

function handleSubmit() {
	const feedback = {
		username: getUserName(),
		uid: auth.currentUser.uid,
		rating: rating.value,
		comment: comment.value
	}
	addDoc(collection(db, 'feedback'), feedback)
		.then(() => {
			toast.success('Feedback submitted!')
			comment.value = ''
			rating.value = 5
			clearDraft() // Clear draft after successful submission
			hasDraftData.value = false
			feedbackList.value.push(feedback)
		}).catch((error) => {
			console.error(error);
		})
}
</script>

<style></style>
