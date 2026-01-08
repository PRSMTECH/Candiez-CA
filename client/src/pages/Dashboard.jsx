import { useAuth } from '../contexts/AuthContext';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome to Candiez Dispensary CRM</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Today&apos;s Sales</h3>
          <p className={styles.statValue}>$0.00</p>
          <span className={styles.statLabel}>Coming Soon</span>
        </div>
        <div className={styles.statCard}>
          <h3>Customers</h3>
          <p className={styles.statValue}>0</p>
          <span className={styles.statLabel}>Coming Soon</span>
        </div>
        <div className={styles.statCard}>
          <h3>Products</h3>
          <p className={styles.statValue}>0</p>
          <span className={styles.statLabel}>Coming Soon</span>
        </div>
        <div className={styles.statCard}>
          <h3>Low Stock</h3>
          <p className={styles.statValue}>0</p>
          <span className={styles.statLabel}>Coming Soon</span>
        </div>
      </div>

      <div className={styles.placeholder}>
        <p>Full dashboard features coming soon!</p>
        <p className={styles.userNote}>
          Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
