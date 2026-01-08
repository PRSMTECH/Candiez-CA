import { useAuth } from '../contexts/AuthContext';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🍬</span>
          <span className={styles.logoText}>Candiez</span>
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user?.firstName || 'User'} {user?.lastName || ''}
          </span>
          <span className={styles.userRole}>({user?.role || 'staff'})</span>
          <button onClick={logout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome to Candiez Dispensary CRM</p>

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
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
