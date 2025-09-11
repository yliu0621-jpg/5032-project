<template>
  <div class="rating-component d-inline-flex align-items-center">
    <template v-for="star in maxStars" :key="star">
      <i role="button" :class="getStarClasses(star)" @click="!readOnly && setRating(star)"
        @mouseover="!readOnly && onMouseOver(star)" @mouseleave="!readOnly && onMouseLeave()"
        :title="`${star} / ${maxStars}`" aria-hidden="true"></i>
    </template>
    <span v-if="showValue" class="ms-2 text-muted small">{{ modelValue }} / {{ maxStars }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // CurrentValue
  modelValue: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0,
  },
  maxStars: {
    type: Number,
    default: 5,
    validator: (value) => value > 0,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  showValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const hoverRating = ref(0)

const setRating = (rating) => {
  emit('update:modelValue', rating)
}

const onMouseOver = (rating) => {
  hoverRating.value = rating
}

const onMouseLeave = () => {
  hoverRating.value = 0
}

// Bootstrap Icons
const getStarClasses = (star) => {
  // Show hovering ratings
  const currentRating = hoverRating.value !== 0 ? hoverRating.value : props.modelValue
  const classes = ['bi mx-1 text-warning'] // Yellow

  if (star <= currentRating) {
    classes.push('bi-star-fill') // Filled Star
  } else {
    classes.push('bi-star') // Empty Star
  }

  return classes
}
</script>

<style scoped></style>
