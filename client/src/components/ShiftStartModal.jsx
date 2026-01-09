import { useState } from 'react';
import Modal from './Modal';
import styles from './ShiftStartModal.module.css';

function ShiftStartModal({ onStartShift, onCancel }) {
  const [startingCash, setStartingCash] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const cashAmount = parseFloat(startingCash);

    if (isNaN(cashAmount) || cashAmount < 0) {
      setError('Please enter a valid cash amount');
      return;
    }

    onStartShift(cashAmount);
  };

  const handleCashChange = (e) => {
    const value = e.target.value;
    // Allow empty string, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setStartingCash(value);
      setError('');
    }
  };

  // Quick amount buttons
  const quickAmounts = [50, 100, 200, 300, 500];

  return (
    <Modal isOpen={true} title="Start Your Shift" onClose={onCancel}>
      <div className={styles.container}>
        <div className={styles.icon}>⏰</div>
        <h2 className={styles.title}>Ready to Start?</h2>
        <p className={styles.description}>
          Enter your starting cash drawer amount to begin your shift.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Starting Cash Amount</label>
            <div className={styles.inputWrapper}>
              <span className={styles.currency}>$</span>
              <input
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={startingCash}
                onChange={handleCashChange}
                placeholder="0.00"
                autoFocus
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.quickAmounts}>
            {quickAmounts.map(amount => (
              <button
                key={amount}
                type="button"
                className={styles.quickBtn}
                onClick={() => setStartingCash(amount.toString())}
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.startBtn}
            >
              Start Shift
            </button>
          </div>
        </form>

        <p className={styles.note}>
          💡 Count your cash drawer before entering the amount
        </p>
      </div>
    </Modal>
  );
}

export default ShiftStartModal;
