import { useAuth } from '../contexts/AuthContext';
import styles from './PagePlaceholder.module.css';

function Transactions() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle}>View and manage sales history</p>
      </div>

      <div className={styles.placeholder}>
        <div className={styles.icon}>🧾</div>
        <h2>Transaction History Coming Soon</h2>
        <p>
          View transaction history, process voids and refunds,
          reprint receipts, and export sales data.
        </p>
        <p className={styles.userNote}>
          Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
        </p>
      </div>
    </div>
  );
}

export default Transactions;
