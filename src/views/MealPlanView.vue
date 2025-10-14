<template>
  <div class="container py-4">
    <header class="text-center mb-5">
      <h1 class="display-5 fw-bold text-primary-emphasis">Meal Management</h1>
      <p class="lead">Manage your meals, ingredients, and nutritional information</p>
    </header>

    <!-- Meals Table -->
    <div class="mb-5">
      <h2 class="mb-3">Weekly Meal Plans</h2>
      <InteractiveTable :data="meals" :columns="mealColumns" :searchable-columns="mealSearchableColumns"
        :rows-per-page="10" row-key="id" initial-sort-column="day" initial-sort-order="asc">
        <template #cell-category="{ value }">
          <span class="badge bg-primary">{{ value }}</span>
        </template>
        <template #cell-calories="{ value }">
          <span class="text-success fw-bold">{{ value }} kcal</span>
        </template>
        <template #cell-status="{ value }">
          <span class="badge" :class="getMealStatusClass(value)">
            {{ value }}
          </span>
        </template>
        <template #cell-actions="{ row }">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" @click="viewMeal(row)">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-success" @click="editMeal(row)">
              <i class="bi bi-pencil"></i>
            </button>
          </div>
        </template>
      </InteractiveTable>
    </div>

    <!-- Ingredients Table -->
    <div class="mb-5">
      <h2 class="mb-3">Ingredients Inventory</h2>
      <InteractiveTable :data="ingredients" :columns="ingredientColumns"
        :searchable-columns="ingredientSearchableColumns" :rows-per-page="10" row-key="id" initial-sort-column="name"
        initial-sort-order="asc">
        <template #cell-price="{ value }">
          <span class="text-primary fw-bold">${{ value.toFixed(2) }}</span>
        </template>
        <template #cell-stock="{ value }">
          <span class="badge" :class="getStockClass(value)">
            {{ value }} {{ value === 1 ? 'unit' : 'units' }}
          </span>
        </template>
        <template #cell-category="{ value }">
          <span class="badge bg-info text-dark">{{ value }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" @click="viewIngredient(row)">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-warning" @click="editIngredient(row)">
              <i class="bi bi-pencil"></i>
            </button>
          </div>
        </template>
      </InteractiveTable>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InteractiveTable from '../components/InteractiveTable.vue'

// Sample data - Meal Plans
const meals = ref([
  { id: 1, day: 'Monday', meal: 'Grilled Chicken Salad', category: 'Lunch', calories: 350, protein: 35, carbs: 15, status: 'Completed' },
  { id: 2, day: 'Monday', meal: 'Pasta Primavera', category: 'Dinner', calories: 480, protein: 18, carbs: 65, status: 'Completed' },
  { id: 3, day: 'Tuesday', meal: 'Greek Yogurt Parfait', category: 'Breakfast', calories: 280, protein: 20, carbs: 32, status: 'Completed' },
  { id: 4, day: 'Tuesday', meal: 'Quinoa Buddha Bowl', category: 'Lunch', calories: 420, protein: 22, carbs: 48, status: 'Planned' },
  { id: 5, day: 'Tuesday', meal: 'Baked Salmon with Veggies', category: 'Dinner', calories: 380, protein: 40, carbs: 20, status: 'Planned' },
  { id: 6, day: 'Wednesday', meal: 'Avocado Toast', category: 'Breakfast', calories: 320, protein: 12, carbs: 35, status: 'Planned' },
  { id: 7, day: 'Wednesday', meal: 'Turkey Wrap', category: 'Lunch', calories: 360, protein: 28, carbs: 38, status: 'Planned' },
  { id: 8, day: 'Wednesday', meal: 'Vegetable Stir Fry', category: 'Dinner', calories: 290, protein: 15, carbs: 42, status: 'Planned' },
  { id: 9, day: 'Thursday', meal: 'Protein Smoothie', category: 'Breakfast', calories: 260, protein: 25, carbs: 28, status: 'Planned' },
  { id: 10, day: 'Thursday', meal: 'Chicken Caesar Wrap', category: 'Lunch', calories: 340, protein: 30, carbs: 32, status: 'Planned' },
  { id: 11, day: 'Thursday', meal: 'Beef Tacos', category: 'Dinner', calories: 440, protein: 32, carbs: 38, status: 'Planned' },
  { id: 12, day: 'Friday', meal: 'Overnight Oats', category: 'Breakfast', calories: 300, protein: 15, carbs: 45, status: 'Planned' },
  { id: 13, day: 'Friday', meal: 'Mediterranean Bowl', category: 'Lunch', calories: 380, protein: 20, carbs: 42, status: 'Planned' },
  { id: 14, day: 'Friday', meal: 'Pizza Night', category: 'Dinner', calories: 520, protein: 22, carbs: 68, status: 'Planned' },
  { id: 15, day: 'Saturday', meal: 'Pancakes with Berries', category: 'Breakfast', calories: 420, protein: 16, carbs: 58, status: 'Planned' }
])

// Sample data - Ingredients
const ingredients = ref([
  { id: 1, name: 'Chicken Breast', category: 'Protein', price: 8.99, stock: 15, unit: 'lbs', expiration: '2024-12-15' },
  { id: 2, name: 'Quinoa', category: 'Grains', price: 6.49, stock: 8, unit: 'bags', expiration: '2025-02-28' },
  { id: 3, name: 'Avocado', category: 'Produce', price: 2.99, stock: 24, unit: 'pieces', expiration: '2024-12-10' },
  { id: 4, name: 'Greek Yogurt', category: 'Dairy', price: 4.99, stock: 12, unit: 'containers', expiration: '2024-12-08' },
  { id: 5, name: 'Salmon Fillet', category: 'Protein', price: 12.99, stock: 6, unit: 'pieces', expiration: '2024-12-12' },
  { id: 6, name: 'Mixed Vegetables', category: 'Produce', price: 3.99, stock: 20, unit: 'bags', expiration: '2024-12-14' },
  { id: 7, name: 'Brown Rice', category: 'Grains', price: 4.49, stock: 18, unit: 'bags', expiration: '2025-04-15' },
  { id: 8, name: 'Eggs', category: 'Protein', price: 5.99, stock: 36, unit: 'dozen', expiration: '2024-12-20' },
  { id: 9, name: 'Spinach', category: 'Produce', price: 2.99, stock: 15, unit: 'bunches', expiration: '2024-12-09' },
  { id: 10, name: 'Almonds', category: 'Nuts', price: 8.99, stock: 10, unit: 'bags', expiration: '2025-01-15' },
  { id: 11, name: 'Olive Oil', category: 'Pantry', price: 9.99, stock: 8, unit: 'bottles', expiration: '2025-08-20' },
  { id: 12, name: 'Berries Mix', category: 'Produce', price: 4.99, stock: 12, unit: 'containers', expiration: '2024-12-11' },
  { id: 13, name: 'Turkey Breast', category: 'Protein', price: 9.99, stock: 10, unit: 'lbs', expiration: '2024-12-18' },
  { id: 14, name: 'Whole Wheat Bread', category: 'Bakery', price: 3.49, stock: 14, unit: 'loaves', expiration: '2024-12-13' },
  { id: 15, name: 'Cheese Blend', category: 'Dairy', price: 5.49, stock: 16, unit: 'packages', expiration: '2024-12-16' },
  { id: 16, name: 'Tomatoes', category: 'Produce', price: 2.49, stock: 30, unit: 'pieces', expiration: '2024-12-12' },
  { id: 17, name: 'Pasta', category: 'Grains', price: 1.99, stock: 25, unit: 'boxes', expiration: '2025-06-30' },
  { id: 18, name: 'Protein Powder', category: 'Supplements', price: 24.99, stock: 8, unit: 'tubs', expiration: '2025-03-10' },
  { id: 19, name: 'Honey', category: 'Pantry', price: 6.99, stock: 12, unit: 'jars', expiration: '2026-12-31' },
  { id: 20, name: 'Bell Peppers', category: 'Produce', price: 3.99, stock: 20, unit: 'pieces', expiration: '2024-12-15' }
])

// Table columns configuration - Meals
const mealColumns = [
  { key: 'day', label: 'Day' },
  { key: 'meal', label: 'Meal' },
  { key: 'category', label: 'Category' },
  { key: 'calories', label: 'Calories' },
  { key: 'protein', label: 'Protein (g)' },
  { key: 'carbs', label: 'Carbs (g)' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' }
]

const mealSearchableColumns = [
  { key: 'day', label: 'Day' },
  { key: 'meal', label: 'Meal' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' }
]

// Table columns configuration - Ingredients
const ingredientColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Ingredient' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  { key: 'unit', label: 'Unit' },
  { key: 'expiration', label: 'Expiration' },
  { key: 'actions', label: 'Actions' }
]

const ingredientSearchableColumns = [
  { key: 'name', label: 'Ingredient' },
  { key: 'category', label: 'Category' }
]

// Methods
const getMealStatusClass = (status) => {
  const classes = {
    'Completed': 'bg-success',
    'Planned': 'bg-primary',
    'Cancelled': 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

const getStockClass = (stock) => {
  if (stock > 20) return 'bg-success'
  if (stock > 10) return 'bg-warning text-dark'
  return 'bg-danger'
}

const viewMeal = (meal) => {
  console.log('View meal:', meal)
}

const editMeal = (meal) => {
  console.log('Edit meal:', meal)
}

const viewIngredient = (ingredient) => {
  console.log('View ingredient:', ingredient)
}

const editIngredient = (ingredient) => {
  console.log('Edit ingredient:', ingredient)
}
</script>
