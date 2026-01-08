import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

// Route mapping for breadcrumb labels
const routeLabels = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  products: 'Products',
  inventory: 'Inventory',
  transactions: 'Transactions',
  reports: 'Reports',
  pos: 'Point of Sale',
  admin: 'Admin',
  users: 'Users',
  settings: 'Settings'
};

/**
 * Breadcrumbs component
 * Automatically generates breadcrumb navigation based on current route
 */
function Breadcrumbs({ customLabel }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on dashboard (home)
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link to="/dashboard" className={styles.link}>
            Dashboard
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          // Get label from route mapping or use custom label for last item
          let label = routeLabels[value] || value;
          if (isLast && customLabel) {
            label = customLabel;
          }

          // Skip 'dashboard' as it's already shown
          if (value === 'dashboard') {
            return null;
          }

          return (
            <li key={to} className={styles.item}>
              <span className={styles.separator}>›</span>
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={to} className={styles.link}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
