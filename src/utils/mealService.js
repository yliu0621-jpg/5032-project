import { doc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

// Meal Plans
export const getMealPlans = async (userId) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'mealPlans'),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting meal plans:', error)
    throw error
  }
}

export const createMealPlan = async (userId, mealData) => {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'mealPlans'), {
      ...mealData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating meal plan:', error)
    throw error
  }
}

export const updateMealPlan = async (userId, mealId, mealData) => {
  try {
    await updateDoc(doc(db, 'users', userId, 'mealPlans', mealId), {
      ...mealData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating meal plan:', error)
    throw error
  }
}

export const deleteMealPlan = async (userId, mealId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'mealPlans', mealId))
  } catch (error) {
    console.error('Error deleting meal plan:', error)
    throw error
  }
}

// Ingredients
export const getIngredients = async (userId) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'ingredients'),
      orderBy('name', 'asc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting ingredients:', error)
    throw error
  }
}

export const createIngredient = async (userId, ingredientData) => {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'ingredients'), {
      ...ingredientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating ingredient:', error)
    throw error
  }
}

export const updateIngredient = async (userId, ingredientId, ingredientData) => {
  try {
    await updateDoc(doc(db, 'users', userId, 'ingredients', ingredientId), {
      ...ingredientData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating ingredient:', error)
    throw error
  }
}

export const deleteIngredient = async (userId, ingredientId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'ingredients', ingredientId))
  } catch (error) {
    console.error('Error deleting ingredient:', error)
    throw error
  }
}

// Helper functions
export const getMealStatusClass = (status) => {
  const classes = {
    'planned': 'bg-primary',
    'completed': 'bg-success',
    'cancelled': 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

export const getStockClass = (stock, minStock = 5) => {
  if (stock > minStock * 2) return 'bg-success'
  if (stock > minStock) return 'bg-warning text-dark'
  return 'bg-danger'
}

export const calculateTotalCalories = (meals) => {
  return meals.reduce((total, meal) => total + (meal.calories || 0), 0)
}

export const calculateTotalProtein = (meals) => {
  return meals.reduce((total, meal) => total + (meal.protein || 0), 0)
}

export const calculateTotalCarbs = (meals) => {
  return meals.reduce((total, meal) => total + (meal.carbs || 0), 0)
}