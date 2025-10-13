import { createApp } from 'vue';
import ToastComponent from '../components/Toast.vue';

// Store all toast instances
const toastInstances = new Map();
let toastIdCounter = 0;

/**
 * Create and display a Toast notification (fixed position: top-right below navbar)
 * @param {Object} options - Toast configuration options
 * @param {string} options.title - Toast title, default is 'Notification'
 * @param {string} options.message - Toast message content
 * @param {string} options.type - Toast type, available values: primary, secondary, success, danger, warning, info, light, dark, default is 'info'
 * @param {number} options.delay - Display time in milliseconds, default is 3000
 * @param {string} options.icon - Custom icon class name, automatically selected based on type by default
 * @param {boolean} options.autohide - Whether to auto hide, default is true
 * @param {string} options.subtitle - Subtitle, optional
 * @returns {string} Toast ID, can be used to manually hide Toast
 */
export function showToast(options = {}) {
  // Default configuration
  const defaultOptions = {
    title: 'Notification',
    message: '',
    type: 'info',
    delay: 3000,
    icon: '',
    autohide: true,
    subtitle: ''
  };

  // Merge configuration
  const config = { ...defaultOptions, ...options };

  // Generate unique ID
  const toastId = `toast-${++toastIdCounter}`;

  // Create or get toast container (fixed position: top-end)
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'position-fixed';
    // Use more specific styles to override Bootstrap
    toastContainer.style.setProperty('top', '80px', 'important');
    toastContainer.style.setProperty('right', '16px', 'important');
    toastContainer.style.setProperty('z-index', '1055', 'important');

    document.body.appendChild(toastContainer);
  }

  // Create individual toast wrapper
  const toastWrapper = document.createElement('div');
  toastWrapper.id = toastId;
  toastWrapper.className = 'toast-wrapper';

  // Add spacing for stacked toasts
  toastWrapper.style.marginBottom = '0.5rem';

  // Create Vue application instance
  const toastApp = createApp(ToastComponent, {
    ...config,
    onHidden: () => {
      // Clean up after Toast is hidden
      setTimeout(() => {
        toastApp.unmount();
        if (toastWrapper.parentNode) {
          toastWrapper.parentNode.removeChild(toastWrapper);
        }
        toastInstances.delete(toastId);

        // Remove container if no more toasts
        if (toastContainer.children.length === 0) {
          document.body.removeChild(toastContainer);
        }
      }, 100);
    }
  });

  // Add toast wrapper to container
  toastContainer.appendChild(toastWrapper);

  // Mount component
  toastApp.mount(toastWrapper);

  // Save instance reference
  toastInstances.set(toastId, {
    app: toastApp,
    container: toastWrapper,
    hide: () => {
      const component = toastApp._component;
      if (component && component.exposed && component.exposed.hide) {
        component.exposed.hide();
      }
    }
  });

  return toastId;
}

/**
 * Hide a specific Toast by ID
 * @param {string} toastId - Toast ID
 */
export function hideToast(toastId) {
  const toastInstance = toastInstances.get(toastId);
  if (toastInstance) {
    toastInstance.hide();
  }
}

/**
 * Hide all Toasts
 */
export function hideAllToasts() {
  toastInstances.forEach((instance) => {
    instance.hide();
  });
}

// Preset shortcut methods
export const toast = {
  /**
   * Success notification
   * @param {string} message - Message content
   * @param {Object} options - Other configuration options
   */
  success(message, options = {}) {
    return showToast({
      type: 'success',
      title: 'Success',
      message,
      ...options
    });
  },

  /**
   * Error notification
   * @param {string} message - Message content
   * @param {Object} options - Other configuration options
   */
  error(message, options = {}) {
    return showToast({
      type: 'danger',
      title: 'Error',
      message,
      delay: 5000, // Error messages display longer
      ...options
    });
  },

  /**
   * Warning notification
   * @param {string} message - Message content
   * @param {Object} options - Other configuration options
   */
  warning(message, options = {}) {
    return showToast({
      type: 'warning',
      title: 'Warning',
      message,
      ...options
    });
  },

  /**
   * Info notification
   * @param {string} message - Message content
   * @param {Object} options - Other configuration options
   */
  info(message, options = {}) {
    return showToast({
      type: 'info',
      title: 'Info',
      message,
      ...options
    });
  },

  /**
   * Primary notification
   * @param {string} message - Message content
   * @param {Object} options - Other configuration options
   */
  primary(message, options = {}) {
    return showToast({
      type: 'primary',
      title: 'Primary',
      message,
      ...options
    });
  }
};

// Default export the main showToast function
export default showToast;
