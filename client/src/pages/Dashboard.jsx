import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, transRes, stockRes] = await Promise.all([
        axios.get('/api/dashboard/stats', { headers }),
        axios.get('/api/transactions/recent', { headers }),
        axios.get('/api/products/low-stock', { headers })
      ]);

      setStats(statsRes.data);
      setRecentTransactions(transRes.data.transactions || transRes.data);
      setLowStockItems(stockRes.data.products || stockRes.data);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      setStats({
        todaySales: 0,
        todayTransactions: 0,
        totalCustomers: 0,
        activeCustomers: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0
      });
      setRecentTransactions([]);
      setLowStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          {getGreeting()}, {user?.firstName || 'User'}! Welcome to Candiez Dispensary CRM
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Today&apos;s Sales</h3>
          <p className={styles.statValue}>{formatCurrency(stats?.todaySales || 0)}</p>
          <span className={styles.statLabel}>{stats?.todayTransactions || 0} transactions</span>
        </div>
        <Link to="/customers" className={`${styles.statCard} ${styles.clickable}`}>
          <h3>Customers</h3>
          <p className={styles.statValue}>{stats?.totalCustomers || 0}</p>
          <span className={styles.statLabel}>{stats?.activeCustomers || 0} active</span>
        </Link>
        <Link to="/products" className={`${styles.statCard} ${styles.clickable}`}>
          <h3>Products</h3>
          <p className={styles.statValue}>{stats?.totalProducts || 0}</p>
          <span className={styles.statLabel}>in catalog</span>
        </Link>
        <Link to="/inventory" className={`${styles.statCard} ${styles.alertCard} ${styles.clickable}`}>
          <h3>Low Stock Alert</h3>
          <p className={styles.statValue}>{stats?.lowStockProducts || 0}</p>
          <span className={styles.statLabel}>{stats?.outOfStockProducts || 0} out of stock</span>
        </Link>
      </div>

      {/* Dashboard Grid */}
      <div className={styles.dashboardGrid}>
        {/* Recent Transactions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Recent Transactions</h2>
            <Link to="/transactions" className={styles.viewAll}>View All</Link>
          </div>
          <div className={styles.cardContent}>
            {recentTransactions.length === 0 ? (
              <p className={styles.empty}>No transactions today</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.slice(0, 5).map((txn) => (
                    <tr key={txn.id} className={txn.status === 'voided' ? styles.voided : ''}>
                      <td>
                        <Link to={`/transactions/${txn.id}`} className={styles.txnLink}>
                          {txn.id}
                        </Link>
                      </td>
                      <td>{txn.customer}</td>
                      <td className={styles.amount}>{formatCurrency(txn.total)}</td>
                      <td className={styles.time}>{txn.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Inventory Alerts</h2>
            <Link to="/inventory" className={styles.viewAll}>Manage Inventory</Link>
          </div>
          <div className={styles.cardContent}>
            {lowStockItems.length === 0 ? (
              <p className={styles.empty}>All items stocked!</p>
            ) : (
              <ul className={styles.alertList}>
                {lowStockItems.map((item) => (
                  <li key={item.id} className={styles.alertItem}>
                    <div className={styles.alertInfo}>
                      <span className={styles.productName}>{item.name}</span>
                      <span className={item.stock === 0 ? styles.outOfStock : styles.lowStock}>
                        {item.stock === 0 ? 'Out of Stock' : `${item.stock} units left`}
                      </span>
                    </div>
                    <Link to={`/products/${item.id}/edit`} className={styles.restock}>
                      Restock
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Quick Actions</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.quickActions}>
              <Link to="/pos" className={styles.actionButton}>
                <span className={styles.actionIcon}>💰</span>
                <span>New Sale</span>
              </Link>
              <Link to="/customers/new" className={styles.actionButton}>
                <span className={styles.actionIcon}>👤</span>
                <span>Add Customer</span>
              </Link>
              <Link to="/products/new" className={styles.actionButton}>
                <span className={styles.actionIcon}>📦</span>
                <span>Add Product</span>
              </Link>
              <Link to="/reports" className={styles.actionButton}>
                <span className={styles.actionIcon}>📊</span>
                <span>View Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.userNote}>
        Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
      </div>
    </div>
  );
}

export default Dashboard;
