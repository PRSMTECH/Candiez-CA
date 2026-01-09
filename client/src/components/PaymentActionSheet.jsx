import { ActionSheet } from 'antd-mobile';
import styles from './PaymentActionSheet.module.css';

/**
 * PaymentActionSheet - Mobile payment method selector
 * Uses antd-mobile ActionSheet for payment selection on checkout
 */
function PaymentActionSheet({ visible, onClose, onSelect, currentMethod }) {
  const actions = [
    {
      key: 'cash',
      text: (
        <div className={styles.actionItem}>
          <span className={styles.icon}>💵</span>
          <div className={styles.actionContent}>
            <span className={styles.actionTitle}>Cash</span>
            <span className={styles.actionDesc}>Pay with paper money</span>
          </div>
          {currentMethod === 'cash' && <span className={styles.checkmark}>✓</span>}
        </div>
      ),
    },
    {
      key: 'debit',
      text: (
        <div className={styles.actionItem}>
          <span className={styles.icon}>💳</span>
          <div className={styles.actionContent}>
            <span className={styles.actionTitle}>Debit Card</span>
            <span className={styles.actionDesc}>PIN-based debit transaction</span>
          </div>
          {currentMethod === 'debit' && <span className={styles.checkmark}>✓</span>}
        </div>
      ),
    },
    {
      key: 'split',
      text: (
        <div className={styles.actionItem}>
          <span className={styles.icon}>💰</span>
          <div className={styles.actionContent}>
            <span className={styles.actionTitle}>Split Payment</span>
            <span className={styles.actionDesc}>Combine cash and card</span>
          </div>
          {currentMethod === 'split' && <span className={styles.checkmark}>✓</span>}
        </div>
      ),
    },
  ];

  const handleAction = (action) => {
    if (action.key) {
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      onSelect(action.key);
    }
    onClose();
  };

  return (
    <ActionSheet
      visible={visible}
      actions={actions}
      onAction={handleAction}
      onClose={onClose}
      cancelText="Cancel"
      className={styles.actionSheet}
      extra={
        <div className={styles.header}>
          <span className={styles.headerIcon}>💳</span>
          <span className={styles.headerTitle}>Select Payment Method</span>
        </div>
      }
    />
  );
}

export default PaymentActionSheet;
