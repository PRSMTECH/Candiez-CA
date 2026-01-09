/**
 * Mobile Confirmation Dialog Helper
 * Uses antd-mobile Dialog for native mobile feel
 * Falls back gracefully on desktop
 */
import { Dialog } from 'antd-mobile';

// Check if we're on mobile viewport
const isMobile = () => {
  return typeof window !== 'undefined' && window.innerWidth < 640;
};

// Candiez theme colors
const THEME_COLORS = {
  primary: '#B57EDC',
  primaryDark: '#7B4A9E',
  danger: '#E74C3C',
  dangerDark: '#C0392B',
  warning: '#F39C12',
  warningDark: '#D68910',
  text: '#1a1a1a',
  textSecondary: '#666',
};

/**
 * Show a confirmation dialog
 * @param {Object} options
 * @param {string} options.title - Dialog title
 * @param {string} options.content - Dialog message content
 * @param {string} options.confirmText - Confirm button text (default: 'Confirm')
 * @param {string} options.cancelText - Cancel button text (default: 'Cancel')
 * @param {string} options.variant - 'danger' | 'warning' | 'info' (default: 'danger')
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export async function showConfirm({
  title = 'Confirm',
  content = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) {
  if (isMobile()) {
    // Use antd-mobile Dialog on mobile
    const buttonColor = variant === 'danger'
      ? THEME_COLORS.danger
      : variant === 'warning'
        ? THEME_COLORS.warning
        : THEME_COLORS.primary;

    return new Promise((resolve) => {
      Dialog.show({
        title,
        content,
        closeOnAction: true,
        closeOnMaskClick: false,
        actions: [
          {
            key: 'cancel',
            text: cancelText,
            style: { color: THEME_COLORS.textSecondary },
            onClick: () => resolve(false),
          },
          {
            key: 'confirm',
            text: confirmText,
            bold: true,
            style: { color: buttonColor },
            onClick: () => resolve(true),
          },
        ],
      });
    });
  }

  // Fall back to native confirm on desktop
  return window.confirm(`${title}\n\n${content}`);
}

/**
 * Show a delete confirmation dialog
 * @param {string} itemName - Name of the item being deleted
 * @returns {Promise<boolean>}
 */
export async function confirmDelete(itemName) {
  return showConfirm({
    title: 'Delete Confirmation',
    content: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger',
  });
}

/**
 * Show a void transaction confirmation dialog
 * @param {string|number} transactionId - Transaction ID being voided
 * @returns {Promise<boolean>}
 */
export async function confirmVoid(transactionId) {
  return showConfirm({
    title: 'Void Transaction',
    content: `Are you sure you want to void transaction #${transactionId}? This action cannot be undone.`,
    confirmText: 'Void',
    cancelText: 'Cancel',
    variant: 'warning',
  });
}

/**
 * Show a refund confirmation dialog
 * @param {string} amount - Refund amount
 * @returns {Promise<boolean>}
 */
export async function confirmRefund(amount) {
  return showConfirm({
    title: 'Process Refund',
    content: `Are you sure you want to process a refund of ${amount}?`,
    confirmText: 'Refund',
    cancelText: 'Cancel',
    variant: 'warning',
  });
}

/**
 * Show an async action confirmation with loading state
 * @param {Object} options
 * @param {string} options.title - Dialog title
 * @param {string} options.content - Dialog message content
 * @param {string} options.confirmText - Confirm button text
 * @param {string} options.loadingText - Text to show while action is pending
 * @param {Function} options.onConfirm - Async function to execute on confirm
 * @param {string} options.variant - 'danger' | 'warning' | 'info'
 * @returns {Promise<boolean>} - Resolves to true if action completed, false if cancelled/failed
 */
export async function showAsyncConfirm({
  title = 'Confirm',
  content = 'Are you sure?',
  confirmText = 'Confirm',
  loadingText = 'Processing...',
  onConfirm,
  variant = 'danger'
}) {
  if (isMobile()) {
    const buttonColor = variant === 'danger'
      ? THEME_COLORS.danger
      : variant === 'warning'
        ? THEME_COLORS.warning
        : THEME_COLORS.primary;

    return new Promise((resolve) => {
      const handler = Dialog.show({
        title,
        content,
        closeOnAction: false,
        closeOnMaskClick: false,
        actions: [
          {
            key: 'cancel',
            text: 'Cancel',
            style: { color: THEME_COLORS.textSecondary },
            onClick: () => {
              handler.close();
              resolve(false);
            },
          },
          {
            key: 'confirm',
            text: confirmText,
            bold: true,
            style: { color: buttonColor },
            onClick: async () => {
              // Update button text to show loading
              handler.update({
                actions: [
                  {
                    key: 'loading',
                    text: loadingText,
                    disabled: true,
                    style: { color: THEME_COLORS.textSecondary },
                  },
                ],
              });

              try {
                await onConfirm();
                handler.close();
                resolve(true);
              } catch (error) {
                handler.close();
                resolve(false);
                throw error;
              }
            },
          },
        ],
      });
    });
  }

  // Desktop fallback
  if (window.confirm(`${title}\n\n${content}`)) {
    try {
      await onConfirm();
      return true;
    } catch (error) {
      return false;
    }
  }
  return false;
}

/**
 * Show an alert dialog (info only, no confirmation needed)
 * @param {Object} options
 * @param {string} options.title - Dialog title
 * @param {string} options.content - Dialog message content
 * @param {string} options.confirmText - Button text (default: 'OK')
 */
export async function showAlert({
  title = 'Alert',
  content,
  confirmText = 'OK'
}) {
  if (isMobile()) {
    return Dialog.alert({
      title,
      content,
      confirmText,
      onConfirm: () => {},
    });
  }

  // Desktop fallback
  window.alert(`${title}\n\n${content}`);
}

// Export all functions as a unified object
const mobileConfirm = {
  show: showConfirm,
  delete: confirmDelete,
  void: confirmVoid,
  refund: confirmRefund,
  async: showAsyncConfirm,
  alert: showAlert,
};

export default mobileConfirm;
