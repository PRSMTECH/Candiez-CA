import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import styles from './Layout.module.css';

function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`${styles.main} ${sidebarCollapsed ? styles.expanded : ''}`}>
        <Breadcrumbs />
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
