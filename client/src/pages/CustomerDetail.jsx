import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CustomerDetail.module.css';

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loyaltyHistory, setLoyaltyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // Fetch customer details
      const customerRes = await axios.get(`/api/customers/${id}`);
      setCustomer(customerRes.data.customer);

      // Fetch customer transactions
      const txnRes = await axios.get(`/api/transactions?customer_id=${id}`);
      setTransactions(txnRes.data.transactions || []);

      // Fetch loyalty history (points earned from transactions)
      const loyaltyRes = await axios.get(`/api/customers/${id}/loyalty`);
      setLoyaltyHistory(loyaltyRes.data.history || []);
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
      if (error.response?.status === 404) {
        navigate('/customers');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>Customer not found</div>
      </div>
    );
  }

  const totalSpent = transactions.reduce((sum, txn) => sum + (txn.total_amount || 0), 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/customers" className={styles.backLink}>← Back to Customers</Link>
          <h1>{customer.first_name} {customer.last_name}</h1>
          <div className={styles.headerMeta}>
            <span className={`${styles.statusBadge} ${styles[customer.status]}`}>
              {customer.status}
            </span>
            <span className={styles.customerId}>ID: {customer.id}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link to={`/customers/${id}/edit`} className={styles.editBtn}>
            Edit Customer
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{customer.loyalty_points || 0}</span>
            <span className={styles.statLabel}>Loyalty Points</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🛒</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{transactions.length}</span>
            <span className={styles.statLabel}>Total Transactions</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{formatCurrency(totalSpent)}</span>
            <span className={styles.statLabel}>Total Spent</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{formatDate(customer.created_at)}</span>
            <span className={styles.statLabel}>Member Since</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'loyalty' ? styles.active : ''}`}
          onClick={() => setActiveTab('loyalty')}
        >
          Loyalty History
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'transactions' ? styles.active : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Purchase History
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            <div className={styles.infoCard}>
              <h3>Contact Information</h3>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{customer.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>{customer.phone || 'Not provided'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Address</span>
                <span className={styles.infoValue}>{customer.address || 'Not provided'}</span>
              </div>
            </div>
            <div className={styles.infoCard}>
              <h3>Personal Details</h3>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Date of Birth</span>
                <span className={styles.infoValue}>{formatDate(customer.date_of_birth)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Age Verified</span>
                <span className={styles.infoValue}>
                  {customer.age_verified ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Notes</span>
                <span className={styles.infoValue}>{customer.notes || 'None'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className={styles.loyaltySection}>
            <div className={styles.loyaltySummary}>
              <div className={styles.pointsBalance}>
                <span className={styles.pointsValue}>{customer.loyalty_points || 0}</span>
                <span className={styles.pointsLabel}>Current Points Balance</span>
              </div>
              <div className={styles.loyaltyInfo}>
                <p>Earn 1 point for every $1 spent</p>
                <p>Points can be redeemed for discounts on future purchases</p>
              </div>
            </div>

            <h3>Points History</h3>
            {loyaltyHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No loyalty history yet. Points are earned with each purchase.</p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {loyaltyHistory.map((item, index) => (
                  <div key={index} className={styles.historyItem}>
                    <div className={styles.historyDetails}>
                      <span className={styles.historyType}>
                        {item.type === 'earned' ? '🎁 Points Earned' : '🎯 Points Redeemed'}
                      </span>
                      <span className={styles.historyDesc}>
                        {item.description || `Transaction #${item.transaction_number}`}
                      </span>
                      <span className={styles.historyDate}>{formatDateTime(item.created_at)}</span>
                    </div>
                    <span className={`${styles.historyPoints} ${item.points >= 0 ? styles.positive : styles.negative}`}>
                      {item.points >= 0 ? '+' : ''}{item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className={styles.transactionsSection}>
            {transactions.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No purchase history yet.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Transaction #</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Points Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td>
                        <Link to={`/transactions/${txn.id}`} className={styles.txnLink}>
                          {txn.transaction_number}
                        </Link>
                      </td>
                      <td>{formatDateTime(txn.created_at)}</td>
                      <td>{txn.item_count || '-'} items</td>
                      <td className={styles.paymentMethod}>{txn.payment_method}</td>
                      <td className={styles.amount}>{formatCurrency(txn.total_amount)}</td>
                      <td className={styles.pointsEarned}>+{txn.loyalty_points_earned || 0} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDetail;
