import { useAuth } from '../contexts/AuthContext';
import styles from './PagePlaceholder.module.css';

function Inventory() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inventory</h1>
        <p className={styles.subtitle}>Track stock levels and manage inventory</p>
      </div>

      <div className={styles.placeholder}>
        <div className={styles.icon}>📦</div>
        <h2>Inventory Management Coming Soon</h2>
        <p>
          Track stock levels, receive inventory, manage batch numbers,
          and monitor low stock alerts with California compliance tracking.
        </p>
        <p className={styles.userNote}>
          Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
        </p>
      </div>
    </div>
  );
}

export default Inventory;
