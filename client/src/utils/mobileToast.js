/**
 * Mobile Toast Helper Functions
 * Uses antd-mobile Toast for native mobile feel
 * Falls back to the existing ToastContext on desktop
 */
import { Toast } from 'antd-mobile';

// Check if we're on mobile viewport
const isMobile = () => {
  return window.innerWidth < 640;
};

// Default configuration
const defaultConfig = {
  duration: 2000,
  position: 'bottom',
  maskClickable: true,
};

// Icon components for different toast types
const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  loading: null, // Uses built-in loading spinner
};

/**
 * Show success toast
 * @param {string} content - Toast message
 * @param {number} duration - Duration in ms (default: 2000)
 */
export function showSuccess(content, duration = defaultConfig.duration) {
  if (isMobile()) {
    Toast.show({
      icon: 'success',
      content,
      duration,
      position: defaultConfig.position,
      maskClickable: defaultConfig.maskClickable,
    });
  }
  return content; // Return for potential desktop fallback
}

/**
 * Show error toast
 * @param {string} content - Toast message
 * @param {number} duration - Duration in ms (default: 3000 for errors)
 */
export function showError(content, duration = 3000) {
  if (isMobile()) {
    Toast.show({
      icon: 'fail',
      content,
      duration,
      position: defaultConfig.position,
      maskClickable: defaultConfig.maskClickable,
    });
  }
  return content;
}

/**
 * Show loading toast
 * @param {string} content - Loading message
 * @returns {Function} - Function to close the loading toast
 */
export function showLoading(content = 'Loading...') {
  if (isMobile()) {
    Toast.show({
      icon: 'loading',
      content,
      duration: 0, // Won't auto close
      maskClickable: false,
    });
    return () => Toast.clear();
  }
  return () => {}; // Noop for desktop
}

/**
 * Show info toast
 * @param {string} content - Toast message
 * @param {number} duration - Duration in ms (default: 2000)
 */
export function showInfo(content, duration = defaultConfig.duration) {
  if (isMobile()) {
    Toast.show({
      content,
      duration,
      position: defaultConfig.position,
      maskClickable: defaultConfig.maskClickable,
    });
  }
  return content;
}

/**
 * Show warning toast
 * @param {string} content - Toast message
 * @param {number} duration - Duration in ms (default: 2500)
 */
export function showWarning(content, duration = 2500) {
  if (isMobile()) {
    Toast.show({
      content: `⚠ ${content}`,
      duration,
      position: defaultConfig.position,
      maskClickable: defaultConfig.maskClickable,
    });
  }
  return content;
}

/**
 * Show custom toast with icon
 * @param {Object} options - Toast options
 * @param {string} options.content - Toast message
 * @param {string} options.icon - Icon to display ('success' | 'fail' | 'loading' | custom)
 * @param {number} options.duration - Duration in ms
 * @param {string} options.position - Position ('top' | 'bottom' | 'center')
 */
export function showCustom({ content, icon, duration = defaultConfig.duration, position = defaultConfig.position }) {
  if (isMobile()) {
    Toast.show({
      icon,
      content,
      duration,
      position,
      maskClickable: defaultConfig.maskClickable,
    });
  }
  return content;
}

/**
 * Clear all toasts
 */
export function clearAllToasts() {
  Toast.clear();
}

/**
 * Configure default toast settings
 * @param {Object} config - Configuration options
 */
export function configureToast(config) {
  Object.assign(defaultConfig, config);
}

// Export a unified toast object
const mobileToast = {
  success: showSuccess,
  error: showError,
  loading: showLoading,
  info: showInfo,
  warning: showWarning,
  custom: showCustom,
  clear: clearAllToasts,
  configure: configureToast,
};

export default mobileToast;
