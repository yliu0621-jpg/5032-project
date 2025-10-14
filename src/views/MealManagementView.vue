<template>
  <div class="container py-4">
    <header class="text-center mb-5">
      <h1 class="display-5 fw-bold text-primary-emphasis">Meal Management</h1>
      <p class="lead">Manage your meals, ingredients, and nutritional information</p>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading your meal data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <strong>Error:</strong> {{ error }}
      <button class="btn btn-outline-danger ms-3" @click="loadData">Retry</button>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Weekly Summary -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-primary">Total Meals</h5>
              <h2 class="text-primary">{{ meals.length }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-success">Total Calories</h5>
              <h2 class="text-success">{{ weeklyStats.totalCalories }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-info">Total Protein</h5>
              <h2 class="text-info">{{ weeklyStats.totalProtein }}g</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-warning">Total Carbs</h5>
              <h2 class="text-warning">{{ weeklyStats.totalCarbs }}g</h2>
            </div>
          </div>
        </div>
      </div>

      <!-- Meal Plans Table -->
      <div class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="mb-0">Meal Plans</h2>
          <button class="btn btn-primary" @click="addMeal">
            <i class="bi bi-plus-circle me-2"></i>Add Meal
          </button>
        </div>

        <InteractiveTable
          :data="meals"
          :columns="mealColumns"
          :searchable-columns="mealSearchableColumns"
          :rows-per-page="10"
          row-key="id"
          initial-sort-column="date"
          initial-sort-order="asc"
        >
          <template #cell-category="{ value }">
            <span class="badge bg-primary">{{ value }}</span>
          </template>
          <template #cell-calories="{ value }">
            <span class="text-success fw-bold">{{ value }} kcal</span>
          </template>
          <template #cell-status="{ value }">
            <span class="badge" :class="getMealStatusClass(value)">
              {{ value.charAt(0).toUpperCase() + value.slice(1) }}
            </span>
          </template>
          <template #cell-actions="{ row }">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-success" @click="editMeal(row)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger" @click="deleteMeal(row)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </template>
        </InteractiveTable>
      </div>

      <!-- Ingredients Table -->
      <div class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="mb-0">Ingredients Inventory</h2>
          <button class="btn btn-primary" @click="addIngredient">
            <i class="bi bi-plus-circle me-2"></i>Add Ingredient
          </button>
        </div>

        <InteractiveTable
          :data="ingredients"
          :columns="ingredientColumns"
          :searchable-columns="ingredientSearchableColumns"
          :rows-per-page="10"
          row-key="id"
          initial-sort-column="name"
          initial-sort-order="asc"
        >
          <template #cell-price="{ value }">
            <span class="text-primary fw-bold">${{ value.toFixed(2) }}</span>
          </template>
          <template #cell-stock="{ value }">
            <span class="badge" :class="getStockClass(value)">
              {{ value }} units
            </span>
          </template>
          <template #cell-category="{ value }">
            <span class="badge bg-info text-dark">{{ value }}</span>
          </template>
          <template #cell-actions="{ row }">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-warning" @click="editIngredient(row)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger" @click="deleteIngredientRow(row)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </template>
        </InteractiveTable>
      </div>
    </div>

    <!-- Add/Edit Meal Modal -->
    <div class="modal fade" id="mealModal" tabindex="-1" ref="mealModalElement">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingMeal.id ? 'Edit Meal' : 'Add Meal' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveMeal">
              <div class="mb-3">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" v-model="editingMeal.date" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Meal Name</label>
                <input type="text" class="form-control" v-model="editingMeal.name" placeholder="e.g., Grilled Chicken Salad" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Category</label>
                <select class="form-select" v-model="editingMeal.category" required>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Calories</label>
                  <input type="number" class="form-control" v-model="editingMeal.calories" min="0" required>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Protein (g)</label>
                  <input type="number" class="form-control" v-model="editingMeal.protein" min="0" step="0.1" required>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Carbs (g)</label>
                  <input type="number" class="form-control" v-model="editingMeal.carbs" min="0" step="0.1" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Status</label>
                <select class="form-select" v-model="editingMeal.status" required>
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea class="form-control" v-model="editingMeal.notes" rows="3" placeholder="Any additional notes..."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveMeal">Save Meal</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Ingredient Modal -->
    <div class="modal fade" id="ingredientModal" tabindex="-1" ref="ingredientModalElement">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingIngredient.id ? 'Edit Ingredient' : 'Add Ingredient' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveIngredient">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" v-model="editingIngredient.name" placeholder="e.g., Chicken Breast" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Category</label>
                <select class="form-select" v-model="editingIngredient.category" required>
                  <option value="protein">Protein</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="dairy">Dairy</option>
                  <option value="nuts">Nuts</option>
                  <option value="pantry">Pantry</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Price ($)</label>
                  <input type="number" class="form-control" v-model="editingIngredient.price" min="0" step="0.01" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Stock (units)</label>
                  <input type="number" class="form-control" v-model="editingIngredient.stock" min="0" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Unit</label>
                <input type="text" class="form-control" v-model="editingIngredient.unit" placeholder="e.g., lbs, kg, pieces" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Expiration Date</label>
                <input type="date" class="form-control" v-model="editingIngredient.expirationDate">
              </div>
              <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea class="form-control" v-model="editingIngredient.notes" rows="2" placeholder="Any additional notes..."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveIngredient">Save Ingredient</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { auth } from '@/firebase'
import { Modal } from 'bootstrap'
import InteractiveTable from '../components/InteractiveTable.vue'
import {
  getMealPlans,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getMealStatusClass,
  getStockClass,
  calculateTotalCalories,
  calculateTotalProtein,
  calculateTotalCarbs
} from '@/utils/mealService'
import { toast } from '@/utils/toast'

// Reactive state
const loading = ref(true)
const error = ref('')
const meals = ref([])
const ingredients = ref([])

// Modal state
const editingMeal = ref({})
const editingIngredient = ref({})

// DOM elements
const mealModalElement = ref(null)
const ingredientModalElement = ref(null)

// Bootstrap modals
const mealModal = ref(null)
const ingredientModal = ref(null)

// Table columns
const mealColumns = [
  { key: 'date', label: 'Date' },
  { key: 'name', label: 'Meal' },
  { key: 'category', label: 'Category' },
  { key: 'calories', label: 'Calories' },
  { key: 'protein', label: 'Protein (g)' },
  { key: 'carbs', label: 'Carbs (g)' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' }
]

const mealSearchableColumns = [
  { key: 'date', label: 'Date' },
  { key: 'name', label: 'Meal' },
  { key: 'category', label: 'Category' },
]

const ingredientColumns = [
  { key: 'name', label: 'Ingredient' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  { key: 'unit', label: 'Unit' },
  { key: 'expirationDate', label: 'Expiration' },
  { key: 'actions', label: 'Actions' }
]

const ingredientSearchableColumns = [
  { key: 'name', label: 'Ingredient' },
  { key: 'category', label: 'Category' }
]

// Computed properties
const weeklyStats = computed(() => ({
  totalCalories: calculateTotalCalories(meals.value),
  totalProtein: calculateTotalProtein(meals.value),
  totalCarbs: calculateTotalCarbs(meals.value)
}))

// Methods
const loadData = async () => {
  if (!auth.currentUser) {
    error.value = 'Please log in to view your meal plans'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = ''

    const [mealData, ingredientData] = await Promise.all([
      getMealPlans(auth.currentUser.uid),
      getIngredients(auth.currentUser.uid)
    ])

    meals.value = mealData
    ingredients.value = ingredientData
  } catch (err) {
    console.error('Error loading data:', err)
    error.value = 'Failed to load data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Meal methods
const addMeal = () => {
  editingMeal.value = {
    date: new Date().toISOString().split('T')[0],
    name: '',
    category: 'breakfast',
    calories: 0,
    protein: 0,
    carbs: 0,
    status: 'planned',
    notes: ''
  }

  mealModal.value.show()
}

const editMeal = (meal) => {
  editingMeal.value = { ...meal }

  mealModal.value.show()
}

const saveMeal = async () => {
  try {
    const userId = auth.currentUser.uid
    const mealData = { ...editingMeal.value }

    if (mealData.id) {
      await updateMealPlan(userId, mealData.id, mealData)
      toast.success('Meal updated successfully!')
    } else {
      const { id, ...mealWithoutId } = mealData
      await createMealPlan(userId, mealWithoutId)
      toast.success('Meal added successfully!')
    }

    await loadData()
    mealModal.value.hide()
  } catch (err) {
    console.error('Error saving meal:', err)
    toast.error('Failed to save meal')
  }
}

const deleteMeal = async (meal) => {
  if (confirm(`Are you sure you want to delete "${meal.name}"?`)) {
    try {
      await deleteMealPlan(auth.currentUser.uid, meal.id)
      toast.success('Meal deleted successfully!')
      await loadData()
    } catch (err) {
      console.error('Error deleting meal:', err)
      toast.error('Failed to delete meal')
    }
  }
}

// Ingredient methods
const addIngredient = () => {
  editingIngredient.value = {
    name: '',
    category: 'protein',
    price: 0,
    stock: 0,
    unit: '',
    expirationDate: '',
    notes: ''
  }

  ingredientModal.value.show()
}

const editIngredient = (ingredient) => {
  editingIngredient.value = { ...ingredient }
  ingredientModal.value.show()
}

const saveIngredient = async () => {
  try {
    const userId = auth.currentUser.uid
    const ingredientData = { ...editingIngredient.value }

    if (ingredientData.id) {
      await updateIngredient(userId, ingredientData.id, ingredientData)
      toast.success('Ingredient updated successfully!')
    } else {
      const { id, ...ingredientWithoutId } = ingredientData
      await createIngredient(userId, ingredientWithoutId)
      toast.success('Ingredient added successfully!')
    }

    await loadData()
    ingredientModal.value.hide()
  } catch (err) {
    console.error('Error saving ingredient:', err)
    toast.error('Failed to save ingredient')
  }
}

const deleteIngredientRow = async (ingredient) => {
  if (confirm(`Are you sure you want to delete "${ingredient.name}"?`)) {
    try {
      await deleteIngredient(auth.currentUser.uid, ingredient.id)
      toast.success('Ingredient deleted successfully!')
      await loadData()
    } catch (err) {
      console.error('Error deleting ingredient:', err)
      toast.error('Failed to delete ingredient')
    }
  }
}

// Lifecycle
onMounted(() => {
  // Initialize modals
  if (mealModalElement.value) {
    mealModal.value = new Modal(mealModalElement.value)
  }
  if (ingredientModalElement.value) {
    ingredientModal.value = new Modal(ingredientModalElement.value)
  }

  loadData()

  // Watch for auth changes
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      loadData()
    } else {
      meals.value = []
      ingredients.value = []
      loading.value = false
    }
  })

  return () => unsubscribe()
})
</script>
