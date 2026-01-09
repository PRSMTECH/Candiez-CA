import { useState } from 'react';
import { NumberKeyboard, Input as AntInput, Popup } from 'antd-mobile';
import styles from './QuantityInput.module.css';

/**
 * QuantityInput - Mobile-friendly quantity input with NumberKeyboard
 * Shows a numeric keypad for entering quantities on mobile devices
 */
function QuantityInput({ value, onChange, maxValue = 999, minValue = 1, label = 'Quantity' }) {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState(String(value || ''));

  const handleOpen = () => {
    setInputValue(String(value || ''));
    setVisible(true);
  };

  const handleClose = () => {
    // Validate and apply value on close
    let numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < minValue) {
      numValue = minValue;
    }
    if (numValue > maxValue) {
      numValue = maxValue;
    }
    onChange(numValue);
    setVisible(false);
  };

  const handleInput = (key) => {
    if (key === 'BACKSPACE') {
      setInputValue(prev => prev.slice(0, -1));
    } else if (key === '-1') {
      // Custom clear key
      setInputValue('');
    } else {
      // Prevent leading zeros and limit length
      const newValue = inputValue + key;
      if (newValue.length <= 3 && parseInt(newValue, 10) <= maxValue) {
        setInputValue(newValue);
      }
    }
  };

  const handleDelete = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    handleClose();
  };

  return (
    <>
      <div className={styles.quantityDisplay} onClick={handleOpen}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>

      <Popup
        visible={visible}
        onMaskClick={handleClose}
        position="bottom"
        className={styles.keyboardPopup}
      >
        <div className={styles.keyboardHeader}>
          <span className={styles.keyboardTitle}>Enter {label}</span>
          <button className={styles.doneBtn} onClick={handleConfirm}>
            Done
          </button>
        </div>
        <div className={styles.inputPreview}>
          <span className={styles.previewLabel}>{label}:</span>
          <span className={styles.previewValue}>{inputValue || '0'}</span>
          {maxValue < 999 && (
            <span className={styles.maxHint}>(max {maxValue})</span>
          )}
        </div>
        <NumberKeyboard
          visible={true}
          onInput={handleInput}
          onDelete={handleDelete}
          onClose={handleConfirm}
          showCloseButton={false}
          customKey="-1"
          confirmText="OK"
          className={styles.keyboard}
        />
      </Popup>
    </>
  );
}

export default QuantityInput;
