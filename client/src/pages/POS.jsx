import { useAuth } from '../contexts/AuthContext';
import styles from './PagePlaceholder.module.css';

function POS() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Point of Sale</h1>
        <p className={styles.subtitle}>Process sales and transactions</p>
      </div>

      <div className={styles.placeholder}>
        <div className={styles.icon}>💳</div>
        <h2>Point of Sale Coming Soon</h2>
        <p>
          Process sales transactions, apply discounts, manage loyalty points,
          and generate receipts. California compliant with daily limits tracking.
        </p>
        <p className={styles.userNote}>
          Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
        </p>
      </div>
    </div>
  );
}

export default POS;
