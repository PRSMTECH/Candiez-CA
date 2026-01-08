import { useAuth } from '../contexts/AuthContext';
import styles from './PagePlaceholder.module.css';

function Reports() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        <p className={styles.subtitle}>Analytics and business insights</p>
      </div>

      <div className={styles.placeholder}>
        <div className={styles.icon}>📊</div>
        <h2>Reports Dashboard Coming Soon</h2>
        <p>
          View sales analytics, inventory reports, customer metrics,
          and staff performance. Export to CSV and PDF.
        </p>
        <p className={styles.userNote}>
          Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
        </p>
      </div>
    </div>
  );
}

export default Reports;
