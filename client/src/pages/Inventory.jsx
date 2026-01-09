import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import axios from 'axios';
import styles from './Inventory.module.css';

function Inventory() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  // Adjustment modal state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [adjustmentQty, setAdjustmentQty] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // History modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/inventory');
      setInventory(response.data.inventory || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (productId) => {
    setLoadingHistory(true);
    try {
      const response = await axios.get(`/api/inventory/adjustments?product_id=${productId}`);
      setAdjustmentHistory(response.data.adjustments || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setAdjustmentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = item.stock_quantity <= item.low_stock_threshold && item.stock_quantity > 0;
    } else if (stockFilter === 'out') {
      matchesStock = item.stock_quantity <= 0;
    } else if (stockFilter === 'ok') {
      matchesStock = item.stock_quantity > item.low_stock_threshold;
    }

    return matchesSearch && matchesStock;
  });

  // Stats
  const totalProducts = inventory.length;
  const lowStockCount = inventory.filter(i => i.stock_quantity <= i.low_stock_threshold && i.stock_quantity > 0).length;
  const outOfStockCount = inventory.filter(i => i.stock_quantity <= 0).length;

  // Open adjustment modal
  const openAdjustModal = (product) => {
    setSelectedProduct(product);
    setAdjustmentType('add');
    setAdjustmentQty(0);
    setAdjustmentReason('');
    setAdjustmentNotes('');
    setShowAdjustModal(true);
  };

  // Close adjustment modal
  const closeAdjustModal = () => {
    setShowAdjustModal(false);
    setSelectedProduct(null);
  };

  // Open history modal
  const openHistoryModal = async (product) => {
    setHistoryProduct(product);
    setShowHistoryModal(true);
    await fetchHistory(product.id);
  };

  // Close history modal
  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setHistoryProduct(null);
    setAdjustmentHistory([]);
  };

  // Submit adjustment
  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustmentQty || adjustmentQty === 0) {
      alert('Please enter a quantity');
      return;
    }
    if (!adjustmentReason) {
      alert('Please select a reason');
      return;
    }

    setSubmitting(true);
    try {
      const quantityChange = adjustmentType === 'add' ? Math.abs(adjustmentQty) : -Math.abs(adjustmentQty);

      await axios.post('/api/inventory/adjust', {
        product_id: selectedProduct.id,
        adjustment_type: adjustmentType,
        quantity_change: quantityChange,
        reason: adjustmentReason,
        notes: adjustmentNotes || null
      });

      // Refresh inventory
      await fetchInventory();
      closeAdjustModal();
    } catch (error) {
      console.error('Adjustment failed:', error);
      alert(error.response?.data?.error || 'Failed to adjust inventory');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate new stock
  const getNewStock = () => {
    if (!selectedProduct) return 0;
    const change = adjustmentType === 'add' ? Math.abs(adjustmentQty) : -Math.abs(adjustmentQty);
    return selectedProduct.stock_quantity + change;
  };

  // Get stock status badge
  const getStockBadge = (item) => {
    if (item.stock_quantity <= 0) {
      return <span className={`${styles.stockBadge} ${styles.stockOut}`}>Out of Stock</span>;
    }
    if (item.stock_quantity <= item.low_stock_threshold) {
      return <span className={`${styles.stockBadge} ${styles.stockLow}`}>Low Stock</span>;
    }
    return <span className={`${styles.stockBadge} ${styles.stockOk}`}>In Stock</span>;
  };

  // Format date
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Inventory Management</h1>
          <p>Track stock levels and manage inventory adjustments • {totalProducts} products</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Total Products</span>
            <span className={styles.statValue}>{totalProducts}</span>
          </div>
          <div className={`${styles.statBox} ${lowStockCount > 0 ? styles.warning : ''}`}>
            <span className={styles.statLabel}>Low Stock</span>
            <span className={styles.statValue}>{lowStockCount}</span>
          </div>
          <div className={`${styles.statBox} ${outOfStockCount > 0 ? styles.danger : ''}`}>
            <span className={styles.statLabel}>Out of Stock</span>
            <span className={styles.statValue}>{outOfStockCount}</span>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Stock Levels</option>
          <option value="ok">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {filteredInventory.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📦</div>
          <p>No products found matching your search.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Batch #</th>
                <th>Expiration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{item.name}</span>
                      <span className={styles.productSku}>{item.sku || 'No SKU'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>
                      {item.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className={styles.stockCell}>{item.stock_quantity}</td>
                  <td className={styles.stockCell}>{item.low_stock_threshold}</td>
                  <td>{getStockBadge(item)}</td>
                  <td>{item.batch_number || '-'}</td>
                  <td>{item.expiration_date ? formatDate(item.expiration_date) : '-'}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.adjustBtn}
                        onClick={() => openAdjustModal(item)}
                      >
                        Adjust
                      </button>
                      <button
                        className={styles.historyBtn}
                        onClick={() => openHistoryModal(item)}
                      >
                        History
                      </button>
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

      {/* Adjustment Modal */}
      {selectedProduct && (
        <Modal isOpen={showAdjustModal} title={`Adjust Stock: ${selectedProduct.name}`} onClose={closeAdjustModal}>
          <form onSubmit={handleSubmitAdjustment} className={styles.modalForm}>
            <div className={styles.adjustmentPreview}>
              <div className={styles.current}>
                Current Stock: <strong>{selectedProduct.stock_quantity}</strong>
              </div>
              <div className={styles.arrow}>↓</div>
              <div className={`${styles.new} ${getNewStock() >= selectedProduct.stock_quantity ? styles.positive : styles.negative}`}>
                New Stock: {getNewStock()}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Adjustment Type</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value)}
              >
                <option value="add">Add Stock (Receive Inventory)</option>
                <option value="remove">Remove Stock (Adjustment)</option>
                <option value="damage">Remove (Damaged/Waste)</option>
                <option value="count">Inventory Count Correction</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Quantity</label>
              <div className={styles.quantityInput}>
                <span>{adjustmentType === 'add' ? '+' : '-'}</span>
                <input
                  type="number"
                  min="1"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <span>units</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Reason *</label>
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                required
              >
                <option value="">Select a reason...</option>
                <option value="received">Received from Supplier</option>
                <option value="returned">Customer Return</option>
                <option value="damaged">Damaged/Defective</option>
                <option value="expired">Expired Product</option>
                <option value="theft">Theft/Shrinkage</option>
                <option value="count_correction">Inventory Count Correction</option>
                <option value="transfer">Transfer to/from Location</option>
                <option value="sample">Promotional Sample</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Notes (Optional)</label>
              <textarea
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                placeholder="Additional details about this adjustment..."
              />
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={closeAdjustModal}>
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={submitting || adjustmentQty === 0}>
                {submitting ? 'Saving...' : 'Save Adjustment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* History Modal */}
      {historyProduct && (
        <Modal isOpen={showHistoryModal} title={`Stock History: ${historyProduct.name}`} onClose={closeHistoryModal}>
          <div className={styles.historyPanel}>
            {loadingHistory ? (
              <div className={styles.loading}>Loading history...</div>
            ) : adjustmentHistory.length === 0 ? (
              <div className={styles.empty}>
                <p>No adjustment history found for this product.</p>
              </div>
            ) : (
              adjustmentHistory.map((adj) => (
                <div key={adj.id} className={styles.historyItem}>
                  <div className={styles.historyDetails}>
                    <div className={styles.historyType}>{adj.adjustment_type}</div>
                    <div className={styles.historyReason}>{adj.reason || 'No reason specified'}</div>
                    {adj.notes && <div className={styles.historyReason}><em>{adj.notes}</em></div>}
                    <div className={styles.historyMeta}>
                      By {adj.user_name || 'Unknown'} • {formatDate(adj.created_at)}
                    </div>
                  </div>
                  <div className={`${styles.historyChange} ${adj.quantity_change >= 0 ? styles.positive : styles.negative}`}>
                    {adj.quantity_change >= 0 ? '+' : ''}{adj.quantity_change}
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Inventory;
