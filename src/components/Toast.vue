<template>
  <div
    class="toast"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    ref="toastElement"
  >
    <div class="toast-header" :class="headerClass">
      <i v-if="displayIcon" class="bi me-2" :class="displayIcon"></i>
      <strong class="me-auto">{{ title }}</strong>
      <small v-if="subtitle">{{ subtitle }}</small>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
    <div class="toast-body" v-if="message">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Toast } from 'bootstrap';

const props = defineProps({
  title: {
    type: String,
    default: 'Notification'
  },
  message: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value)
  },
  delay: {
    type: Number,
    default: 3000
  },
  icon: {
    type: String,
    default: ''
  },
  autohide: {
    type: Boolean,
    default: true
  }
});

const toastElement = ref(null);
let toastInstance = null;

const headerClass = computed(() => {
  return `bg-${props.type} text-white`;
});

const defaultIcons = {
  primary: 'bi-info-circle-fill',
  secondary: 'bi-info-circle-fill',
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-triangle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
  light: 'bi-info-circle-fill',
  dark: 'bi-info-circle-fill'
};

const displayIcon = computed(() => {
  if (props.icon) return props.icon;
  return defaultIcons[props.type] || '';
});

onMounted(() => {
  if (toastElement.value) {
    toastInstance = new Toast(toastElement.value, {
      delay: props.delay,
      autohide: props.autohide
    });

    // Show toast
    toastInstance.show();

    // Listen for hidden event to destroy component
    toastElement.value.addEventListener('hidden.bs.toast', () => {
      if (toastInstance) {
        toastInstance.dispose();
      }
      // Emit event to parent component
      emit('hidden');
    });
  }
});

const emit = defineEmits(['hidden']);

// Expose method to parent component
const hide = () => {
  if (toastInstance) {
    toastInstance.hide();
  }
};

defineExpose({
  hide
});
</script>

<style scoped>
.toast {
  z-index: 1055;
}
</style>
