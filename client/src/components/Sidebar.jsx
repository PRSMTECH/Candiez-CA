import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AnimatedLogo from './AnimatedLogo';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  FolderTree,
  Warehouse,
  Receipt,
  BarChart3,
  Gift,
  Award,
  Settings,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import styles from './Sidebar.module.css';

function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Role-based access control for menu items
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const showAdminSection = isAdmin || isManager;

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      roles: ['admin', 'manager', 'budtender']
    },
    {
      path: '/pos',
      icon: ShoppingCart,
      label: 'Point of Sale',
      roles: ['admin', 'manager', 'budtender']
    },
    {
      path: '/customers',
      icon: Users,
      label: 'Customers',
      roles: ['admin', 'manager', 'budtender']
    },
    {
      path: '/products',
      icon: Package,
      label: 'Products',
      roles: ['admin', 'manager', 'budtender']
    },
    {
      path: '/categories',
      icon: FolderTree,
      label: 'Categories',
      roles: ['admin', 'manager']
    },
    {
      path: '/inventory',
      icon: Warehouse,
      label: 'Inventory',
      roles: ['admin', 'manager']
    },
    {
      path: '/transactions',
      icon: Receipt,
      label: 'Transactions',
      roles: ['admin', 'manager']
    },
    {
      path: '/reports',
      icon: BarChart3,
      label: 'Reports',
      roles: ['admin', 'manager']
    },
    {
      path: '/referrals',
      icon: Gift,
      label: 'Referrals',
      roles: ['admin', 'manager', 'budtender']
    }
  ];

  // Admin-only menu items
  const adminMenuItems = [
    {
      path: '/admin/referrals',
      icon: Award,
      label: 'Ambassador Admin',
      roles: ['admin', 'manager']
    },
    {
      path: '/admin/users',
      icon: UserCog,
      label: 'Staff',
      roles: ['admin']
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings',
      roles: ['admin']
    }
  ];

  const canAccess = (roles) => {
    return roles.includes(user?.role);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <AnimatedLogo
          size={collapsed ? 'small' : 'medium'}
          showText={false}
          animationInterval={5000}
        />
      </div>

      {/* Toggle Button */}
      <button
        className={styles.toggleBtn}
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Main Navigation */}
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => {
            if (!canAccess(item.roles)) return null;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.menuLink} ${isActive ? styles.active : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={20} className={styles.menuIcon} />
                  {!collapsed && <span className={styles.menuLabel}>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Admin Section - Visible to admins and managers */}
        {showAdminSection && (
          <>
            <div className={styles.divider}>
              {!collapsed && <span>Admin</span>}
            </div>
            <ul className={styles.menuList}>
              {adminMenuItems.map((item) => {
                if (!canAccess(item.roles)) return null;
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `${styles.menuLink} ${isActive ? styles.active : ''}`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={20} className={styles.menuIcon} />
                      {!collapsed && <span className={styles.menuLabel}>{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* User Section */}
      <div className={styles.userSection}>
        {!collapsed && (
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user?.firstName || 'User'} {user?.lastName || ''}
            </span>
            <span className={styles.userRole}>{user?.role || 'staff'}</span>
          </div>
        )}
        <div className={styles.userActions}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {!collapsed && <span>{isDark ? 'Light' : 'Dark'}</span>}
          </button>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
