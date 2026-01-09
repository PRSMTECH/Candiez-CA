import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
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
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [transactionToVoid, setTransactionToVoid] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidLoading, setVoidLoading] = useState(false);

  // Refund state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [transactionToRefund, setTransactionToRefund] = useState(null);
  const [refundItems, setRefundItems] = useState([]);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

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

  const handleVoidClick = (transaction) => {
    setTransactionToVoid(transaction);
    setVoidReason('');
    setVoidModalOpen(true);
  };

  const handleVoidConfirm = async () => {
    if (!transactionToVoid || !voidReason.trim()) return;

    setVoidLoading(true);
    try {
      await axios.post(`/api/transactions/${transactionToVoid.id}/void`, {
        reason: voidReason.trim()
      });

      // Update local state
      setTransactions(prev =>
        prev.map(t =>
          t.id === transactionToVoid.id
            ? { ...t, payment_status: 'voided', voided: true }
            : t
        )
      );

      setVoidModalOpen(false);
      setTransactionToVoid(null);
      setVoidReason('');
    } catch (error) {
      console.error('Failed to void transaction:', error);
      alert(error.response?.data?.error || 'Failed to void transaction');
    } finally {
      setVoidLoading(false);
    }
  };

  const handleVoidCancel = () => {
    setVoidModalOpen(false);
    setTransactionToVoid(null);
    setVoidReason('');
  };

  // Refund handlers
  const handleRefundClick = async (transaction) => {
    setTransactionToRefund(transaction);
    setRefundReason('');
    setRefundItems([]);
    setRefundModalOpen(true);
    setLoadingItems(true);

    try {
      // Fetch transaction items for this transaction
      const response = await axios.get(`/api/transactions/${transaction.id}`);
      const items = response.data.items || [];
      // Initialize refund items with selection state and refund quantity
      setRefundItems(items.map(item => ({
        ...item,
        selected: false,
        refundQuantity: item.quantity
      })));
    } catch (error) {
      console.error('Failed to fetch transaction items:', error);
      alert('Failed to load transaction items');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleRefundItemToggle = (itemId) => {
    setRefundItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const handleRefundQuantityChange = (itemId, quantity) => {
    setRefundItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, refundQuantity: Math.min(Math.max(1, quantity), item.quantity) }
          : item
      )
    );
  };

  const handleRefundConfirm = async () => {
    if (!transactionToRefund) return;

    const selectedItems = refundItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert('Please select at least one item to refund');
      return;
    }

    setRefundLoading(true);
    try {
      await axios.post(`/api/transactions/${transactionToRefund.id}/refund`, {
        reason: refundReason.trim(),
        items: selectedItems.map(item => ({
          transaction_item_id: item.id,
          quantity: item.refundQuantity
        }))
      });

      // Determine new status based on whether all items were refunded
      const allItemsFullyRefunded = refundItems.every(item =>
        item.selected && item.refundQuantity === item.quantity
      );
      const newStatus = allItemsFullyRefunded ? 'refunded' : 'partial_refund';

      // Update local state
      setTransactions(prev =>
        prev.map(t =>
          t.id === transactionToRefund.id
            ? { ...t, payment_status: newStatus }
            : t
        )
      );

      setRefundModalOpen(false);
      setTransactionToRefund(null);
      setRefundItems([]);
      setRefundReason('');
    } catch (error) {
      console.error('Failed to process refund:', error);
      alert(error.response?.data?.error || 'Failed to process refund');
    } finally {
      setRefundLoading(false);
    }
  };

  const handleRefundCancel = () => {
    setRefundModalOpen(false);
    setTransactionToRefund(null);
    setRefundItems([]);
    setRefundReason('');
  };

  const calculateRefundTotal = () => {
    return refundItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.unit_price * item.refundQuantity), 0);
  };

  // Check if user can void transactions (admin or manager only)
  const canVoidTransactions = user?.role === 'admin' || user?.role === 'manager';

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
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleView(txn.id)}
                        className={styles.viewButton}
                        title="View transaction details"
                      >
                        View
                      </button>
                      {canVoidTransactions && txn.payment_status === 'completed' && (
                        <>
                          <button
                            onClick={() => handleVoidClick(txn)}
                            className={styles.voidButton}
                            title="Void transaction"
                          >
                            Void
                          </button>
                          <button
                            onClick={() => handleRefundClick(txn)}
                            className={styles.refundButton}
                            title="Refund transaction"
                          >
                            Refund
                          </button>
                        </>
                      )}
                    </div>
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

      {/* Void Transaction Modal */}
      <Modal
        isOpen={voidModalOpen}
        onClose={handleVoidCancel}
        title="Void Transaction"
        size="small"
      >
        <div className={styles.voidModal}>
          {transactionToVoid && (
            <>
              <p className={styles.voidWarning}>
                ⚠️ You are about to void transaction <strong>{transactionToVoid.transaction_number}</strong>
              </p>
              <p className={styles.voidInfo}>
                Amount: <strong>${transactionToVoid.total?.toFixed(2)}</strong>
                {transactionToVoid.customer_name && (
                  <> • Customer: <strong>{transactionToVoid.customer_name}</strong></>
                )}
              </p>
              <p className={styles.voidNote}>
                This action will restore inventory and reverse any loyalty points earned.
              </p>
              <div className={styles.voidForm}>
                <label className={styles.voidLabel}>
                  Reason for voiding (required):
                </label>
                <textarea
                  className={styles.voidTextarea}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Enter reason for voiding this transaction..."
                  rows={3}
                />
              </div>
              <div className={styles.voidActions}>
                <button
                  className={styles.voidCancelBtn}
                  onClick={handleVoidCancel}
                  disabled={voidLoading}
                >
                  Cancel
                </button>
                <button
                  className={styles.voidConfirmBtn}
                  onClick={handleVoidConfirm}
                  disabled={voidLoading || !voidReason.trim()}
                >
                  {voidLoading ? 'Processing...' : 'Confirm Void'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Refund Transaction Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={handleRefundCancel}
        title="Refund Transaction"
        size="medium"
      >
        <div className={styles.refundModal}>
          {transactionToRefund && (
            <>
              <p className={styles.refundInfo}>
                Transaction: <strong>{transactionToRefund.transaction_number}</strong>
                {transactionToRefund.customer_name && (
                  <> • Customer: <strong>{transactionToRefund.customer_name}</strong></>
                )}
              </p>

              <div className={styles.refundItemsSection}>
                <label className={styles.refundLabel}>Select items to refund:</label>
                {loadingItems ? (
                  <p className={styles.loadingText}>Loading items...</p>
                ) : refundItems.length === 0 ? (
                  <p className={styles.emptyText}>No items found for this transaction</p>
                ) : (
                  <div className={styles.refundItemsList}>
                    {refundItems.map(item => (
                      <div key={item.id} className={styles.refundItem}>
                        <label className={styles.refundItemCheckbox}>
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleRefundItemToggle(item.id)}
                          />
                          <span className={styles.refundItemName}>{item.product_name}</span>
                        </label>
                        <div className={styles.refundItemDetails}>
                          <span className={styles.refundItemPrice}>
                            ${item.unit_price?.toFixed(2)} each
                          </span>
                          {item.selected && (
                            <div className={styles.refundQuantityWrapper}>
                              <label>Qty:</label>
                              <input
                                type="number"
                                min="1"
                                max={item.quantity}
                                value={item.refundQuantity}
                                onChange={(e) => handleRefundQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className={styles.refundQuantityInput}
                              />
                              <span className={styles.refundMaxQty}>/ {item.quantity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.refundTotalSection}>
                <span>Refund Subtotal:</span>
                <strong>{formatCurrency(calculateRefundTotal())}</strong>
              </div>

              <div className={styles.refundForm}>
                <label className={styles.refundLabel}>
                  Reason for refund (optional):
                </label>
                <textarea
                  className={styles.refundTextarea}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter reason for this refund..."
                  rows={2}
                />
              </div>

              <p className={styles.refundNote}>
                This will restore inventory for refunded items and reverse loyalty points if applicable.
              </p>

              <div className={styles.refundActions}>
                <button
                  className={styles.refundCancelBtn}
                  onClick={handleRefundCancel}
                  disabled={refundLoading}
                >
                  Cancel
                </button>
                <button
                  className={styles.refundConfirmBtn}
                  onClick={handleRefundConfirm}
                  disabled={refundLoading || refundItems.filter(i => i.selected).length === 0}
                >
                  {refundLoading ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Transactions;
