import { useAuth } from '../contexts/AuthContext';
import styles from './PagePlaceholder.module.css';

function Customers() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customers</h1>
        <p className={styles.subtitle}>Customer Relationship Management</p>
      </div>

      <div className={styles.placeholder}>
        <div className={styles.icon}>👥</div>
        <h2>Customer Management Coming Soon</h2>
        <p>
          Search, add, and manage your dispensary customers. Track purchase history,
          loyalty points, and preferences.
        </p>
        <p className={styles.userNote}>
          Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
        </p>
      </div>
    </div>
  );
}

export default Customers;
