const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sgMail = require('@sendgrid/mail')

// Initialize Firebase Admin
admin.initializeApp()

// Initialize SendGrid
const config = functions.config()
const sendGridApiKey = config.sendgrid?.api_key
const fromEmail = config.sendgrid?.from_email

console.log('SendGrid configured successfully!')
console.log('- From Email:', fromEmail)

sgMail.setApiKey(sendGridApiKey)

// Export all user data via email
exports.exportUserData = functions.https.onCall(async (data, context) => {
  // SendGrid is already configured during initialization

  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    )
  }

  const userId = context.auth.uid
  const userEmail = context.auth.token.email

  if (!userEmail) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User email is required for export.'
    )
  }

  try {
    // Fetch all user data
    const [mealPlans, ingredients, feedback] = await Promise.all([
      fetchMealPlans(userId),
      fetchIngredients(userId),
      fetchFeedback(userId)
    ])

    // Generate CSV files
    const mealPlansCSV = generateMealPlansCSV(mealPlans)
    const ingredientsCSV = generateIngredientsCSV(ingredients)
    const feedbackCSV = generateFeedbackCSV(feedback)

    // Generate summary statistics
    const summary = generateSummary(mealPlans, ingredients, feedback)

    // Create email content
    const emailContent = createEmailContent(mealPlans, ingredients, feedback, summary)

    // Send email with attachments
    await sendExportEmail(userEmail, emailContent, {
      mealPlansCSV,
      ingredientsCSV,
      feedbackCSV
    })

    return {
      success: true,
      message: 'Your data export has been sent to your email address.',
      summary: summary
    }

  } catch (error) {
    console.error('Error exporting user data:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to export user data. Please try again later.'
    )
  }
})

// Fetch meal plans from Firestore
async function fetchMealPlans(userId) {
  const mealPlansSnapshot = await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('mealPlans')
    .orderBy('createdAt', 'desc')
    .get()

  return mealPlansSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Fetch ingredients from Firestore
async function fetchIngredients(userId) {
  const ingredientsSnapshot = await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('ingredients')
    .orderBy('name', 'asc')
    .get()

  return ingredientsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Fetch feedback from Firestore
async function fetchFeedback(userId) {
  const feedbackSnapshot = await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('feedback')
    .orderBy('createdAt', 'desc')
    .get()

  return feedbackSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Generate CSV for meal plans
function generateMealPlansCSV(mealPlans) {
  const headers = [
    'ID',
    'Date',
    'Meal Name',
    'Category',
    'Calories',
    'Protein (g)',
    'Carbs (g)',
    'Status',
    'Notes',
    'Created At',
    'Updated At'
  ]

  const rows = mealPlans.map(meal => [
    meal.id || '',
    meal.date || '',
    meal.name || '',
    meal.category || '',
    meal.calories || 0,
    meal.protein || 0,
    meal.carbs || 0,
    meal.status || '',
    (meal.notes || '').replace(/"/g, '""'), // Escape quotes
    meal.createdAt ? new Date(meal.createdAt._seconds * 1000).toISOString() : '',
    meal.updatedAt ? new Date(meal.updatedAt._seconds * 1000).toISOString() : ''
  ])

  return convertToCSV(headers, rows)
}

// Generate CSV for ingredients
function generateIngredientsCSV(ingredients) {
  const headers = [
    'ID',
    'Name',
    'Category',
    'Price',
    'Stock',
    'Unit',
    'Expiration Date',
    'Notes',
    'Created At',
    'Updated At'
  ]

  const rows = ingredients.map(ingredient => [
    ingredient.id || '',
    ingredient.name || '',
    ingredient.category || '',
    ingredient.price || 0,
    ingredient.stock || 0,
    ingredient.unit || '',
    ingredient.expirationDate || '',
    (ingredient.notes || '').replace(/"/g, '""'), // Escape quotes
    ingredient.createdAt ? new Date(ingredient.createdAt._seconds * 1000).toISOString() : '',
    ingredient.updatedAt ? new Date(ingredient.updatedAt._seconds * 1000).toISOString() : ''
  ])

  return convertToCSV(headers, rows)
}

// Generate CSV for feedback
function generateFeedbackCSV(feedback) {
  const headers = [
    'ID',
    'Type',
    'Rating',
    'Message',
    'Created At'
  ]

  const rows = feedback.map(item => [
    item.id || '',
    item.type || '',
    item.rating || '',
    (item.message || '').replace(/"/g, '""'), // Escape quotes
    item.createdAt ? new Date(item.createdAt._seconds * 1000).toISOString() : ''
  ])

  return convertToCSV(headers, rows)
}

// Convert arrays to CSV format
function convertToCSV(headers, rows) {
  const csvHeaders = headers.map(header => `"${header}"`).join(',')
  const csvRows = rows.map(row =>
    row.map(cell => {
      // Handle cells that contain commas, quotes, or newlines
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }).join(',')
  )

  return csvHeaders + '\n' + csvRows.join('\n')
}

// Generate summary statistics
function generateSummary(mealPlans, ingredients, feedback) {
  const totalCalories = mealPlans.reduce((sum, meal) => sum + (meal.calories || 0), 0)
  const totalProtein = mealPlans.reduce((sum, meal) => sum + (meal.protein || 0), 0)
  const totalCarbs = mealPlans.reduce((sum, meal) => sum + (meal.carbs || 0), 0)
  const totalIngredientsValue = ingredients.reduce((sum, ingredient) => sum + ((ingredient.price || 0) * (ingredient.stock || 0)), 0)

  const statusCounts = mealPlans.reduce((counts, meal) => {
    const status = meal.status || 'unknown'
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {})

  const categoryCounts = mealPlans.reduce((counts, meal) => {
    const category = meal.category || 'unknown'
    counts[category] = (counts[category] || 0) + 1
    return counts
  }, {})

  return {
    totalMealPlans: mealPlans.length,
    totalIngredients: ingredients.length,
    totalFeedback: feedback.length,
    totalCalories: totalCalories,
    totalProtein: totalProtein,
    totalCarbs: totalCarbs,
    totalIngredientsValue: totalIngredientsValue.toFixed(2),
    statusBreakdown: statusCounts,
    categoryBreakdown: categoryCounts,
    exportDate: new Date().toISOString()
  }
}

// Create email content
function createEmailContent(mealPlans, ingredients, feedback, summary) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Meal Management Data</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Hi there! 👋</h2>
    <p>Here's all your meal management data exported on ${new Date().toLocaleDateString()}.</p>

    <h3>Quick Summary:</h3>
    <ul>
        <li>Meal Plans: ${summary.totalMealPlans}</li>
        <li>Ingredients: ${summary.totalIngredients}</li>
        <li>Feedback: ${summary.totalFeedback}</li>
        <li>Total Calories: ${summary.totalCalories} kcal</li>
        <li>Total Protein: ${summary.totalProtein}g</li>
        <li>Total Carbs: ${summary.totalCarbs}g</li>
    </ul>

    <p>I've attached your data as CSV files:</p>
    <ul>
        <li><strong>meal-plans.csv</strong> - All your meal plans</li>
        <li><strong>ingredients.csv</strong> - Your ingredient list</li>
        <li><strong>feedback.csv</strong> - Your feedback history</li>
    </ul>

    <h3>Meal Status:</h3>
    <ul>
        ${Object.entries(summary.statusBreakdown).map(([status, count]) =>
            `<li>${status}: ${count}</li>`
        ).join('')}
    </ul>

    <h3>Meal Categories:</h3>
    <ul>
        ${Object.entries(summary.categoryBreakdown).map(([category, count]) =>
            `<li>${category}: ${count}</li>`
        ).join('')}
    </ul>

    <p>Thanks for using the meal management system!</p>
</body>
</html>
  `
}

// Send export email with attachments
async function sendExportEmail(userEmail, htmlContent, attachments) {
  const fromEmail = functions.config().sendgrid?.from_email

  const msg = {
    to: userEmail,
    from: {
      email: fromEmail,
      name: 'Meal Management System'
    },
    subject: `Your Meal Management Data Export - ${new Date().toLocaleDateString()}`,
    html: htmlContent,
    attachments: [
      {
        filename: 'meal-plans.csv',
        content: Buffer.from(attachments.mealPlansCSV, 'utf8').toString('base64'),
        type: 'text/csv',
        disposition: 'attachment'
      },
      {
        filename: 'ingredients.csv',
        content: Buffer.from(attachments.ingredientsCSV, 'utf8').toString('base64'),
        type: 'text/csv',
        disposition: 'attachment'
      },
      {
        filename: 'feedback.csv',
        content: Buffer.from(attachments.feedbackCSV, 'utf8').toString('base64'),
        type: 'text/csv',
        disposition: 'attachment'
      }
    ]
  }

  try {
    await sgMail.send(msg)
    console.log('Email sent successfully to:', userEmail)
  } catch (error) {
    console.error('SendGrid error details:', error.response?.body)
    throw error
  }
}
