<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Admin Dashboard</h1>
      <div class="badge bg-danger fs-6">Admin</div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-primary">Total Users</h5>
            <h2 class="text-primary">{{ totalUsers }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-success">Active Users</h5>
            <h2 class="text-success">{{ activeUsers }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-info">Total Meals</h5>
            <h2 class="text-info">{{ totalMeals }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-warning">Total Feedback</h5>
            <h2 class="text-warning">{{ totalFeedback }}</h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">User Registration Trend</h5>
          </div>
          <div class="card-body">
            <div id="userTrendChart" style="height: 300px;"></div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">User Types</h5>
          </div>
          <div class="card-body">
            <div id="userTypeChart" style="height: 300px;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Management -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">User Management</h5>
        <button class="btn btn-primary btn-sm" @click="loadUsers">
          <i class="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading user data...</p>
        </div>
        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <div v-else>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Join Date</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.uid">
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge" :class="user.role === 'admin' ? 'bg-danger' : 'bg-primary'">
                      {{ user.role || 'user' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>{{ formatDate(user.lastLoginAt) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-info" @click="viewUserDetails(user)">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-outline-warning" @click="toggleUserRole(user)"
                        v-if="user.uid !== currentUser?.uid">
                        <i class="bi bi-shield"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div class="modal fade" id="userDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">User Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedUser">
            <div class="row">
              <div class="col-md-6">
                <h6>Basic Information</h6>
                <p><strong>Email:</strong> {{ selectedUser.email }}</p>
                <p><strong>Role:</strong> {{ selectedUser.role || 'user' }}</p>
                <p><strong>User ID:</strong> {{ selectedUser.uid }}</p>
              </div>
              <div class="col-md-6">
                <h6>Activity</h6>
                <p><strong>Join Date:</strong> {{ formatDate(selectedUser.createdAt) }}</p>
                <p><strong>Last Login:</strong> {{ formatDate(selectedUser.lastLoginAt) }}</p>
                <p><strong>Meal Count:</strong> {{ selectedUser.mealCount || 0 }}</p>
                <p><strong>Feedback Count:</strong> {{ selectedUser.feedbackCount || 0 }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { auth, db } from '@/firebase'
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import * as echarts from 'echarts'
import { Modal } from 'bootstrap'
import { toast } from '@/utils/toast'
import { getMealPlans } from '@/utils/mealService'

// Reactive state
const loading = ref(true)
const error = ref('')
const users = ref([])
const currentUser = ref(null)

// Statistics
const totalUsers = ref(0)
const activeUsers = ref(0)
const totalMeals = ref(0)
const totalFeedback = ref(0)

// Charts
const userTrendChart = ref(null)
const userTypeChart = ref(null)

// Modal
const selectedUser = ref(null)
let userDetailsModal = null

// Methods
const loadUsers = async () => {
  try {
    loading.value = true
    error.value = ''

    // Load users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const userSnapshot = await getDocs(usersQuery)
    users.value = userSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))

    // Load all meals and feedback data for statistics
    const feedbackQuery = query(collection(db, 'feedback'))
    const feedbackSnapshot = await getDocs(feedbackQuery)
    const allFeedback = feedbackSnapshot.docs.map(doc => doc.data())

    // Load all meals for each user
    let allMeals = []
    for (const user of users.value) {
      try {
        const userMeals = await getMealPlans(user.uid)
        allMeals = [...allMeals, ...userMeals.map(meal => ({ ...meal, userId: user.uid }))]
      } catch (err) {
        console.error(`Error loading meals for user ${user.uid}:`, err)
      }
    }

    // Calculate statistics
    totalUsers.value = users.value.length
    activeUsers.value = users.value.filter(user => user.lastLoginAt).length
    totalMeals.value = allMeals.length
    totalFeedback.value = allFeedback.length

    // Add counts to user objects for details modal
    users.value = users.value.map(user => {
      const userMeals = allMeals.filter(meal => meal.userId === user.uid)
      const userFeedback = allFeedback.filter(feedback => feedback.uid === user.uid)

      return {
        ...user,
        mealCount: userMeals.length,
        feedbackCount: userFeedback.length
      }
    })

    // Initialize charts
    nextTick(() => {
      initializeCharts()
    })

  } catch (err) {
    console.error('Error loading users:', err)
    error.value = 'Failed to load user data'
  } finally {
    loading.value = false
  }
}

const initializeCharts = () => {
  initializeUserTrendChart()
  initializeUserTypeChart()
}

const initializeUserTrendChart = () => {
  const chartDom = document.getElementById('userTrendChart')
  if (!chartDom) return

  userTrendChart.value = echarts.init(chartDom)

  // Group users by day
  const dailyUsers = {}
  users.value.forEach(user => {
    if (user.createdAt) {
      const date = new Date(user.createdAt.seconds * 1000)
      const dayKey = date.toISOString().split('T')[0] // YYYY-MM-DD format
      dailyUsers[dayKey] = (dailyUsers[dayKey] || 0) + 1
    }
  })

  // Sort dates and get last 30 days for better visualization
  const allDates = Object.keys(dailyUsers).sort()
  const last30Days = allDates.slice(-30)
  const counts = last30Days.map(day => dailyUsers[day])

  const option = {
    title: {
      text: 'User Registrations by Day',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: last30Days.map(day => {
        const date = new Date(day)
        return `${date.getMonth() + 1}/${date.getDate()}` // MM/DD format
      })
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [{
      data: counts,
      type: 'line',
      smooth: true,
      areaStyle: {},
      itemStyle: {
        color: '#007bff'
      }
    }]
  }

  userTrendChart.value.setOption(option)
}

const initializeUserTypeChart = () => {
  const chartDom = document.getElementById('userTypeChart')
  if (!chartDom) return

  userTypeChart.value = echarts.init(chartDom)

  const adminCount = users.value.filter(user => user.role === 'admin').length
  const userCount = users.value.filter(user => user.role !== 'admin').length

  const option = {
    title: {
      text: 'User Distribution',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [{
      name: 'User Types',
      type: 'pie',
      radius: '50%',
      data: [
        { value: userCount, name: 'Regular Users', itemStyle: { color: '#007bff' } },
        { value: adminCount, name: 'Admins', itemStyle: { color: '#dc3545' } }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  userTypeChart.value.setOption(option)
}

const viewUserDetails = (user) => {
  selectedUser.value = user
  userDetailsModal.show()
}

const toggleUserRole = async (user) => {
  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, { role: newRole })

    user.role = newRole
    toast.success(`User role changed to ${newRole}`)

    // Reinitialize charts to reflect changes
    initializeUserTypeChart()
  } catch (err) {
    console.error('Error updating user role:', err)
    toast.error('Failed to update user role')
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Never'
  try {
    return new Date(timestamp.seconds * 1000).toLocaleDateString()
  } catch (err) {
    return 'Invalid date'
  }
}

const handleResize = () => {
  userTrendChart.value?.resize()
  userTypeChart.value?.resize()
}

// Lifecycle
onMounted(() => {
  // Initialize modal
  userDetailsModal = new Modal(document.getElementById('userDetailsModal'))

  // Check if user is admin
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      return
    }

    currentUser.value = user
    loadUsers()
  })

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  userTrendChart.value?.dispose()
  userTypeChart.value?.dispose()
})
</script>

<style scoped>
.badge {
  font-size: 0.75em;
}
</style>
