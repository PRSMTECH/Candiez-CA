import { useAuth } from '../contexts/AuthContext';
import styles from './PagePlaceholder.module.css';

function Settings() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>System configuration and preferences</p>
      </div>

      <div className={styles.placeholder}>
        <div className={styles.icon}>⚙️</div>
        <h2>Settings Coming Soon</h2>
        <p>
          Configure business profile, tax rates, receipt templates, loyalty program settings,
          and notification preferences.
        </p>
        <p className={styles.userNote}>
          Admin access granted: {user?.firstName || 'User'} ({user?.role || 'admin'})
        </p>
      </div>
    </div>
  );
}

export default Settings;
