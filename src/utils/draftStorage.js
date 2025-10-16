const DRAFT_KEY = 'feedback_draft'

export const saveDraft = (draft) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      ...draft,
      savedAt: new Date().toISOString()
    }))
    return true
  } catch (error) {
    console.error('Error saving draft:', error)
    return false
  }
}

export const getDraft = () => {
  try {
    const item = localStorage.getItem(DRAFT_KEY)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error('Error reading draft:', error)
    return null
  }
}

export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY)
    return true
  } catch (error) {
    console.error('Error clearing draft:', error)
    return false
  }
}

export const hasDraft = () => {
  return getDraft() !== null
}
