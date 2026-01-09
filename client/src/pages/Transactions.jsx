import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './Transactions.module.css';

function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (transactionId) => {
    navigate(`/transactions/${transactionId}`);
  };

  const filteredTransactions = transactions.filter(txn => {
    // Search by transaction number or customer name
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      (txn.transaction_number && txn.transaction_number.toLowerCase().includes(searchLower)) ||
      (txn.customer_name && txn.customer_name.toLowerCase().includes(searchLower));

    // Filter by status
    const matchesStatus = statusFilter === 'all' || txn.payment_status === statusFilter;

    // Filter by date
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const txnDate = new Date(txn.created_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        matchesDate = txnDate >= today;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = txnDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = txnDate >= monthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: styles.statusCompleted,
      pending: styles.statusPending,
      voided: styles.statusVoided,
      refunded: styles.statusRefunded
    };
    return statusStyles[status] || styles.statusCompleted;
  };

  const getTotalSales = () => {
    return filteredTransactions
      .filter(t => t.payment_status === 'completed')
      .reduce((sum, t) => sum + (t.total || 0), 0);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.subtitle}>
            View and manage sales transactions • {filteredTransactions.length} records
          </p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Total Sales</span>
            <span className={styles.statValue}>{formatCurrency(getTotalSales())}</span>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search by transaction ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="voided">Voided</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className={styles.empty}>
          <p>No transactions found matching your search.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className={txn.voided ? styles.voidedRow : ''}>
                  <td>
                    <span className={styles.transactionId}>{txn.transaction_number}</span>
                  </td>
                  <td className={styles.dateCell}>
                    {formatDate(txn.created_at)}
                  </td>
                  <td>
                    <span className={styles.customerName}>
                      {txn.customer_name || 'Walk-in'}
                    </span>
                  </td>
                  <td className={styles.amountCell}>
                    {formatCurrency(txn.subtotal)}
                  </td>
                  <td className={styles.amountCell}>
                    {formatCurrency(txn.tax_amount)}
                  </td>
                  <td className={styles.totalCell}>
                    {formatCurrency(txn.total)}
                    {txn.discount_amount > 0 && (
                      <span className={styles.discount}>
                        -{formatCurrency(txn.discount_amount)} discount
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={styles.paymentMethod}>
                      {txn.payment_method}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadge(txn.payment_status)}`}>
                      {txn.payment_status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleView(txn.id)}
                      className={styles.viewButton}
                      title="View transaction details"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.userNote}>
        Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
      </div>
    </div>
  );
}

export default Transactions;
