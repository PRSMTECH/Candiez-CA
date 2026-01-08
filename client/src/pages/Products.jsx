import { useAuth } from '../contexts/AuthContext';
import styles from './PagePlaceholder.module.css';

function Products() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Products</h1>
        <p className={styles.subtitle}>Manage your product catalog</p>
      </div>

      <div className={styles.placeholder}>
        <div className={styles.icon}>🌿</div>
        <h2>Product Catalog Coming Soon</h2>
        <p>
          Add, edit, and manage products. Track strains, THC/CBD levels,
          pricing, and categories (Flower, Edibles, Concentrates, etc.).
        </p>
        <p className={styles.userNote}>
          Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
        </p>
      </div>
    </div>
  );
}

export default Products;
