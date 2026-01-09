import { useToast } from '../contexts/ToastContext';
import styles from './Toast.module.css';

function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite" aria-label="Notifications">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          style={{ '--index': index }}
          role="alert"
        >
          <div className={styles.icon}>
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </div>
          <div className={styles.message}>{toast.message}</div>
          <button
            className={styles.closeBtn}
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
