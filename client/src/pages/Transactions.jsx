import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './Transactions.module.css';

// Mock transaction data for development
const mockTransactions = [
  {
    id: 'TXN-001',
    date: '2024-01-15T14:30:00',
    customer: { id: 1, name: 'John Smith' },
    items: [
      { name: 'Blue Dream', quantity: 2, price: 45.00 },
      { name: 'OG Kush', quantity: 1, price: 50.00 }
    ],
    subtotal: 140.00,
    tax: 33.25,
    discount: 0,
    total: 173.25,
    paymentMethod: 'cash',
    status: 'completed',
    employee: { id: 1, name: 'Admin User' }
  },
  {
    id: 'TXN-002',
    date: '2024-01-15T15:45:00',
    customer: { id: 2, name: 'Sarah Johnson' },
    items: [
      { name: 'Sour Diesel', quantity: 3, price: 48.00 },
      { name: 'CBD Calm Tincture', quantity: 1, price: 65.00 }
    ],
    subtotal: 209.00,
    tax: 49.64,
    discount: 20.90,
    total: 237.74,
    paymentMethod: 'debit',
    status: 'completed',
    employee: { id: 2, name: 'Manager User' }
  },
  {
    id: 'TXN-003',
    date: '2024-01-15T16:20:00',
    customer: { id: 3, name: 'Michael Williams' },
    items: [
      { name: 'Skywalker OG Cartridge', quantity: 2, price: 55.00 }
    ],
    subtotal: 110.00,
    tax: 26.13,
    discount: 0,
    total: 136.13,
    paymentMethod: 'cash',
    status: 'completed',
    employee: { id: 3, name: 'Budtender User' }
  },
  {
    id: 'TXN-004',
    date: '2024-01-15T17:00:00',
    customer: { id: 4, name: 'Emily Brown' },
    items: [
      { name: 'GSC Pre-Roll 5pk', quantity: 3, price: 40.00 },
      { name: 'Blue Dream', quantity: 2, price: 45.00 }
    ],
    subtotal: 210.00,
    tax: 49.88,
    discount: 42.00,
    total: 217.88,
    paymentMethod: 'debit',
    status: 'completed',
    employee: { id: 1, name: 'Admin User' }
  },
  {
    id: 'TXN-005',
    date: '2024-01-15T18:30:00',
    customer: { id: 5, name: 'David Garcia' },
    items: [
      { name: 'OG Kush', quantity: 1, price: 50.00 }
    ],
    subtotal: 50.00,
    tax: 11.88,
    discount: 0,
    total: 61.88,
    paymentMethod: 'cash',
    status: 'voided',
    employee: { id: 2, name: 'Manager User' },
    voidReason: 'Customer changed mind'
  }
];

function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions || response.data);
    } catch {
      // Use mock data for development
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (transactionId) => {
    navigate(`/transactions/${transactionId}`);
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
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
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.total, 0);
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
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
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
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className={txn.status === 'voided' ? styles.voidedRow : ''}>
                  <td>
                    <span className={styles.transactionId}>{txn.id}</span>
                  </td>
                  <td className={styles.dateCell}>
                    {formatDate(txn.date)}
                  </td>
                  <td>
                    <span className={styles.customerName}>{txn.customer.name}</span>
                  </td>
                  <td>
                    <span className={styles.itemCount}>
                      {txn.items.length} item{txn.items.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className={styles.totalCell}>
                    {formatCurrency(txn.total)}
                    {txn.discount > 0 && (
                      <span className={styles.discount}>
                        -{formatCurrency(txn.discount)} discount
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={styles.paymentMethod}>
                      {txn.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadge(txn.status)}`}>
                      {txn.status}
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
