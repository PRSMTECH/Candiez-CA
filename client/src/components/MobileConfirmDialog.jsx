/**
 * MobileConfirmDialog - Uses antd-mobile Dialog on mobile, falls back to standard ConfirmDialog
 * Provides a native mobile feel for confirmation dialogs
 */
import { useEffect, useState } from 'react';
import { Dialog } from 'antd-mobile';
import ConfirmDialog from './ConfirmDialog';

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
 * MobileConfirmDialog component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {function} props.onClose - Called when dialog should close
 * @param {function} props.onConfirm - Called when user confirms
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Confirmation message
 * @param {string} props.confirmText - Text for confirm button
 * @param {string} props.cancelText - Text for cancel button
 * @param {string} props.variant - 'danger' | 'warning' | 'info'
 * @param {boolean} props.loading - Show loading state
 */
function MobileConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mobile dialog
  useEffect(() => {
    if (!mobile || !isOpen) return;

    const buttonColor = variant === 'danger'
      ? THEME_COLORS.danger
      : variant === 'warning'
        ? THEME_COLORS.warning
        : THEME_COLORS.primary;

    const handler = Dialog.show({
      title,
      content: message,
      closeOnAction: true,
      closeOnMaskClick: false,
      actions: loading
        ? [
            {
              key: 'loading',
              text: 'Processing...',
              disabled: true,
              style: { color: THEME_COLORS.textSecondary },
            },
          ]
        : [
            {
              key: 'cancel',
              text: cancelText,
              style: { color: THEME_COLORS.textSecondary },
              onClick: () => {
                onClose();
              },
            },
            {
              key: 'confirm',
              text: confirmText,
              bold: true,
              style: { color: buttonColor },
              onClick: () => {
                onConfirm();
              },
            },
          ],
    });

    return () => {
      handler.close();
    };
  }, [mobile, isOpen, title, message, confirmText, cancelText, variant, loading, onClose, onConfirm]);

  // On mobile, we use the imperative Dialog API above
  if (mobile) {
    return null;
  }

  // On desktop, use the standard ConfirmDialog component
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      variant={variant}
    />
  );
}

export default MobileConfirmDialog;
