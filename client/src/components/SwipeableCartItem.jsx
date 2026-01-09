import { useState, useRef } from 'react';
import { SwipeAction } from 'antd-mobile';
import QuantityInput from './QuantityInput';
import styles from './SwipeableCartItem.module.css';

/**
 * SwipeableCartItem - Cart item with swipe gestures for mobile
 * Left swipe: Edit quantity
 * Right swipe: Remove item
 */
function SwipeableCartItem({ item, onQuantityChange, onRemove }) {
  const swipeRef = useRef(null);
  const [showQuantityEdit, setShowQuantityEdit] = useState(false);

  // Haptic feedback (if available)
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleEditClick = () => {
    triggerHaptic();
    setShowQuantityEdit(true);
    // Close swipe action
    if (swipeRef.current) {
      swipeRef.current.close();
    }
  };

  const handleRemoveClick = () => {
    triggerHaptic();
    onRemove(item.product_id);
  };

  const handleQuantityChange = (newQty) => {
    onQuantityChange(item.product_id, newQty);
    setShowQuantityEdit(false);
  };

  const leftActions = [
    {
      key: 'edit',
      text: '✏️ Edit',
      color: '#B57EDC',
      onClick: handleEditClick,
    },
  ];

  const rightActions = [
    {
      key: 'delete',
      text: '🗑 Remove',
      color: '#DC2626',
      onClick: handleRemoveClick,
    },
  ];

  return (
    <div className={styles.swipeContainer}>
      <SwipeAction
        ref={swipeRef}
        leftActions={leftActions}
        rightActions={rightActions}
        onAction={(action) => {
          triggerHaptic();
        }}
      >
        <div className={styles.cartItem}>
          <div className={styles.itemInfo}>
            <div className={styles.itemName}>{item.name}</div>
            <div className={styles.itemPrice}>
              ${item.price.toFixed(2)} × {item.quantity}
            </div>
          </div>
          <div className={styles.itemTotal}>
            ${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      </SwipeAction>

      {/* Quantity edit modal */}
      {showQuantityEdit && (
        <div className={styles.quantityEditOverlay} onClick={() => setShowQuantityEdit(false)}>
          <div className={styles.quantityEditModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.editHeader}>
              <span>Edit Quantity</span>
              <button onClick={() => setShowQuantityEdit(false)}>✕</button>
            </div>
            <div className={styles.editContent}>
              <div className={styles.productName}>{item.name}</div>
              <QuantityInput
                value={item.quantity}
                onChange={handleQuantityChange}
                maxValue={item.max_quantity}
                minValue={1}
                label="Quantity"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SwipeableCartItem;
