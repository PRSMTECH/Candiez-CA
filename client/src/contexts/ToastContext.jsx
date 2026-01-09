import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Toast as AntdToast } from 'antd-mobile';

const ToastContext = createContext(null);

let toastId = 0;

// Check if we're on mobile viewport
const isMobile = () => {
  return typeof window !== 'undefined' && window.innerWidth < 640;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mobile, setMobile] = useState(false);

  // Track viewport size for responsive toast behavior
  useEffect(() => {
    const checkMobile = () => setMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    // Use antd-mobile Toast on mobile
    if (isMobile()) {
      const iconMap = {
        success: 'success',
        error: 'fail',
        warning: null,
        info: null,
      };

      AntdToast.show({
        icon: iconMap[type],
        content: type === 'warning' ? `⚠ ${message}` : message,
        duration: duration,
        position: 'bottom',
        maskClickable: true,
      });
      return ++toastId;
    }

    // Use custom toast on desktop
    const id = ++toastId;
    const toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration = 2000) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration = 3000) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message, duration = 2500) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message, duration = 2000) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  // Loading toast - returns a function to close it
  const loading = useCallback((message = 'Loading...') => {
    if (isMobile()) {
      AntdToast.show({
        icon: 'loading',
        content: message,
        duration: 0, // Won't auto close
        maskClickable: false,
      });
      return () => AntdToast.clear();
    }

    // Desktop: use info toast that doesn't auto-close
    const id = addToast(message, 'info', 0);
    return () => removeToast(id);
  }, [addToast, removeToast]);

  // Clear all toasts
  const clearAll = useCallback(() => {
    if (isMobile()) {
      AntdToast.clear();
    }
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
      loading,
      clearAll,
      isMobile: mobile
    }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
