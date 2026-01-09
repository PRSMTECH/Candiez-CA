import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from 'antd-mobile';
import styles from './MobileNavBar.module.css';

/**
 * MobileNavBar - Top navigation bar for mobile with back button
 * Shows on screens <640px, provides back navigation and page title
 */
function MobileNavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    // Handle exact matches first
    const routes = {
      '/dashboard': 'Dashboard',
      '/pos': 'Point of Sale',
      '/customers': 'Customers',
      '/customers/new': 'New Customer',
      '/products': 'Products',
      '/products/new': 'New Product',
      '/categories': 'Categories',
      '/inventory': 'Inventory',
      '/transactions': 'Transactions',
      '/reports': 'Reports',
      '/settings': 'Settings',
      '/admin/users': 'Staff',
      '/login': 'Login',
    };

    if (routes[path]) {
      return routes[path];
    }

    // Handle dynamic routes
    if (path.match(/^\/customers\/\d+\/edit$/)) {
      return 'Edit Customer';
    }
    if (path.match(/^\/customers\/\d+$/)) {
      return 'Customer Details';
    }
    if (path.match(/^\/products\/\d+\/edit$/)) {
      return 'Edit Product';
    }
    if (path.match(/^\/transactions\/\d+$/)) {
      return 'Transaction Details';
    }

    return 'Candiez';
  };

  // Determine if we should show back button
  const shouldShowBack = () => {
    const path = location.pathname;
    // Don't show back on main tabs
    const mainTabs = ['/dashboard', '/pos', '/customers', '/products', '/categories'];
    return !mainTabs.includes(path);
  };

  const handleBack = () => {
    // Try to go back in history, or navigate to dashboard
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className={styles.mobileNavBar}>
      <NavBar
        className={styles.navBar}
        backArrow={shouldShowBack()}
        onBack={handleBack}
      >
        {getPageTitle()}
      </NavBar>
    </div>
  );
}

export default MobileNavBar;
