import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './TransactionDetail.module.css';

// Mock transaction data for development
const mockTransactions = {
  'TXN-001': {
    id: 'TXN-001',
    date: '2024-01-15T14:30:00',
    customer: { id: 1, name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567' },
    items: [
      { id: 1, name: 'Blue Dream', quantity: 2, unitPrice: 45.00, total: 90.00 },
      { id: 2, name: 'OG Kush', quantity: 1, unitPrice: 50.00, total: 50.00 }
    ],
    subtotal: 140.00,
    tax: 33.25,
    taxRate: 23.75,
    discount: 0,
    discountType: null,
    total: 173.25,
    paymentMethod: 'cash',
    status: 'completed',
    employee: { id: 1, name: 'Admin User' },
    register: 'Register 1',
    notes: ''
  },
  'TXN-002': {
    id: 'TXN-002',
    date: '2024-01-15T15:45:00',
    customer: { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 234-5678' },
    items: [
      { id: 3, name: 'Sour Diesel', quantity: 3, unitPrice: 48.00, total: 144.00 },
      { id: 4, name: 'CBD Calm Tincture', quantity: 1, unitPrice: 65.00, total: 65.00 }
    ],
    subtotal: 209.00,
    tax: 49.64,
    taxRate: 23.75,
    discount: 20.90,
    discountType: 'VIP 10%',
    total: 237.74,
    paymentMethod: 'debit',
    status: 'completed',
    employee: { id: 2, name: 'Manager User' },
    register: 'Register 2',
    notes: 'VIP customer discount applied'
  },
  'TXN-003': {
    id: 'TXN-003',
    date: '2024-01-15T16:20:00',
    customer: { id: 3, name: 'Michael Williams', email: 'mike.w@email.com', phone: '(555) 345-6789' },
    items: [
      { id: 5, name: 'Skywalker OG Cartridge', quantity: 2, unitPrice: 55.00, total: 110.00 }
    ],
    subtotal: 110.00,
    tax: 26.13,
    taxRate: 23.75,
    discount: 0,
    discountType: null,
    total: 136.13,
    paymentMethod: 'cash',
    status: 'completed',
    employee: { id: 3, name: 'Budtender User' },
    register: 'Register 1',
    notes: ''
  },
  'TXN-005': {
    id: 'TXN-005',
    date: '2024-01-15T18:30:00',
    customer: { id: 5, name: 'David Garcia', email: 'david.g@email.com', phone: '(555) 567-8901' },
    items: [
      { id: 2, name: 'OG Kush', quantity: 1, unitPrice: 50.00, total: 50.00 }
    ],
    subtotal: 50.00,
    tax: 11.88,
    taxRate: 23.75,
    discount: 0,
    discountType: null,
    total: 61.88,
    paymentMethod: 'cash',
    status: 'voided',
    employee: { id: 2, name: 'Manager User' },
    register: 'Register 2',
    notes: '',
    voidReason: 'Customer changed mind',
    voidedBy: { id: 2, name: 'Manager User' },
    voidedAt: '2024-01-15T18:35:00'
  }
};

function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Transform API response to match expected format
        const txn = response.data.transaction || response.data;
        const items = response.data.items || [];

        // Build transformed transaction object
        const transformedTxn = {
          ...txn,
          id: txn.transaction_id || txn.id,
          date: txn.created_at || txn.date,
          customer: txn.customer_name ? {
            name: txn.customer_name,
            email: txn.customer_email || 'N/A',
            phone: txn.customer_phone || 'N/A'
          } : { name: 'Walk-in Customer', email: 'N/A', phone: 'N/A' },
          employee: { name: txn.user_name || 'Unknown' },
          register: 'Register 1',
          paymentMethod: txn.payment_method || 'cash',
          status: txn.voided ? 'voided' : 'completed',
          subtotal: txn.subtotal || 0,
          tax: txn.tax || 0,
          taxRate: 7.75,
          discount: txn.discount_amount || 0,
          discountType: txn.discount_type || null,
          total: txn.total || 0,
          items: items.map(item => ({
            id: item.id,
            name: item.product_name || item.name,
            quantity: item.quantity,
            unitPrice: item.unit_price || item.price,
            total: item.total || (item.quantity * (item.unit_price || item.price))
          })),
          notes: txn.notes || ''
        };
        setTransaction(transformedTxn);
      } catch {
        // Use mock data for development
        const txn = mockTransactions[id];
        if (txn) {
          setTransaction(txn);
        } else {
          setError('Transaction not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading transaction...</div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error || 'Transaction not found'}</p>
          <button onClick={() => navigate('/transactions')} className={styles.backButton}>
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/transactions')} className={styles.backLink}>
          ← Back to Transactions
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Transaction {transaction.id}
            <span className={`${styles.statusBadge} ${getStatusBadge(transaction.status)}`}>
              {transaction.status}
            </span>
          </h1>
          <p className={styles.subtitle}>{formatDate(transaction.date)}</p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Customer Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Customer Information</h2>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name</span>
              <span className={styles.value}>{transaction.customer.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{transaction.customer.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Phone</span>
              <span className={styles.value}>{transaction.customer.phone}</span>
            </div>
          </div>
        </div>

        {/* Transaction Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Transaction Details</h2>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Payment Method</span>
              <span className={styles.value} style={{ textTransform: 'capitalize' }}>
                {transaction.paymentMethod}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Employee</span>
              <span className={styles.value}>{transaction.employee.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Register</span>
              <span className={styles.value}>{transaction.register}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className={styles.itemsCard}>
        <h2 className={styles.cardTitle}>Items Purchased</h2>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items.map((item, index) => (
              <tr key={index}>
                <td className={styles.productName}>{item.name}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{item.quantity}</td>
                <td className={styles.itemTotal}>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{formatCurrency(transaction.subtotal)}</span>
          </div>
          {transaction.discount > 0 && (
            <div className={styles.totalRow + ' ' + styles.discountRow}>
              <span>Discount {transaction.discountType && `(${transaction.discountType})`}</span>
              <span>-{formatCurrency(transaction.discount)}</span>
            </div>
          )}
          <div className={styles.totalRow}>
            <span>Tax ({transaction.taxRate}%)</span>
            <span>{formatCurrency(transaction.tax)}</span>
          </div>
          <div className={styles.totalRow + ' ' + styles.grandTotal}>
            <span>Total</span>
            <span>{formatCurrency(transaction.total)}</span>
          </div>
        </div>
      </div>

      {/* Void Info (if voided) */}
      {transaction.status === 'voided' && (
        <div className={styles.voidCard}>
          <h2 className={styles.cardTitle}>Void Information</h2>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Reason</span>
              <span className={styles.value}>{transaction.voidReason}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Voided By</span>
              <span className={styles.value}>{transaction.voidedBy?.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Voided At</span>
              <span className={styles.value}>{formatDate(transaction.voidedAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {transaction.notes && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Notes</h2>
          <p className={styles.notes}>{transaction.notes}</p>
        </div>
      )}

      <div className={styles.userNote}>
        Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
      </div>
    </div>
  );
}

export default TransactionDetail;
