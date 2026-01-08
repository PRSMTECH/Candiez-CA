import { useAuth } from '../../contexts/AuthContext';
import styles from '../PagePlaceholder.module.css';

function Users() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Staff Management</h1>
        <p className={styles.subtitle}>Manage staff accounts and permissions</p>
      </div>

      <div className={styles.placeholder}>
        <div className={styles.icon}>👥</div>
        <h2>Staff Management Coming Soon</h2>
        <p>
          Create, edit, and manage staff accounts. Assign roles (admin, manager, budtender)
          and track staff activity.
        </p>
        <p className={styles.userNote}>
          Admin access granted: {user?.firstName || 'User'} ({user?.role || 'admin'})
        </p>
      </div>
    </div>
  );
}

export default Users;
