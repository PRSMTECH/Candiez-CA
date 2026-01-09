import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import axios from 'axios';
import styles from './POS.module.css';

function POS() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [showRedeemInput, setShowRedeemInput] = useState(false);

  // Fetch products and customers on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes, categoriesRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/customers'),
          axios.get('/api/categories')
        ]);
        setProducts(productsRes.data.products || []);
        setCustomers(customersRes.data.customers || []);
        setCategories(categoriesRes.data.categories || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || product.category_id === parseInt(categoryFilter);
    return matchesSearch && matchesCategory && product.is_active;
  });

  // Add product to cart
  const addToCart = useCallback((product) => {
    if (product.stock_quantity <= 0) return;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product_id === product.id);
      if (existing) {
        // Check if we have enough stock
        if (existing.quantity >= product.stock_quantity) return prevCart;
        return prevCart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, {
        product_id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        quantity: 1,
        max_quantity: product.stock_quantity
      }];
    });
  }, []);

  // Update cart item quantity
  const updateQuantity = useCallback((productId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product_id !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.max_quantity) return item;
        return { ...item, quantity: newQty };
      }).filter(Boolean);
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
    setPointsToRedeem(0);
    setShowRedeemInput(false);
  }, []);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.0775; // California cannabis tax
  const taxAmount = subtotal * taxRate;
  // Points discount: 1 point = $0.01
  const pointsDiscount = pointsToRedeem * 0.01;
  const total = Math.max(0, subtotal + taxAmount - pointsDiscount);

  // Max points that can be redeemed (can't exceed subtotal + tax or customer's points)
  const maxRedeemablePoints = selectedCustomer
    ? Math.min(selectedCustomer.loyalty_points || 0, Math.floor((subtotal + taxAmount) * 100))
    : 0;

  // Process checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setProcessing(true);
    try {
      const transactionData = {
        customer_id: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod,
        discount_amount: pointsDiscount,
        loyalty_points_used: pointsToRedeem,
        notes: null
      };

      const response = await axios.post('/api/transactions', transactionData);

      // Show receipt
      setReceipt({
        transactionNumber: response.data.transaction.transaction_number,
        total: response.data.transaction.total,
        items: cart,
        customer: selectedCustomer,
        paymentMethod,
        pointsUsed: pointsToRedeem,
        pointsDiscount: pointsDiscount
      });

      // Clear cart after successful transaction
      setCart([]);
      setSelectedCustomer(null);
      setPointsToRedeem(0);
      setShowRedeemInput(false);

      // Refresh products to update stock levels
      const productsRes = await axios.get('/api/products');
      setProducts(productsRes.data.products || []);

    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.error || 'Failed to process transaction');
    } finally {
      setProcessing(false);
    }
  };

  // Close receipt modal
  const closeReceipt = () => {
    setReceipt(null);
  };

  // Get strain badge class
  const getStrainClass = (strain) => {
    switch (strain?.toLowerCase()) {
      case 'indica': return styles.indica;
      case 'sativa': return styles.sativa;
      case 'hybrid': return styles.hybrid;
      case 'cbd': return styles.cbd;
      default: return '';
    }
  };

  // Get stock status class
  const getStockClass = (qty) => {
    if (qty <= 0) return styles.out;
    if (qty <= 5) return styles.low;
    return '';
  };

  // Get category emoji
  const getCategoryEmoji = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    switch (category?.name?.toLowerCase()) {
      case 'flower': return '🌿';
      case 'edibles': return '🍫';
      case 'concentrates': return '💎';
      case 'pre-rolls': return '🚬';
      case 'topicals': return '🧴';
      case 'accessories': return '🛠️';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading POS...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Point of Sale</h1>
          <p className={styles.subtitle}>Process sales and transactions</p>
        </div>
      </div>

      {/* Products Section */}
      <div className={styles.productsSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.categoryFilter}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.productsGrid}>
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIcon}>📦</div>
              <p>No products found</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div
                key={product.id}
                className={`${styles.productCard} ${product.stock_quantity <= 0 ? styles.outOfStock : ''}`}
                onClick={() => addToCart(product)}
              >
                <div className={styles.productImage}>
                  {getCategoryEmoji(product.category_id)}
                </div>
                <div className={styles.productName}>{product.name}</div>
                {product.strain_type && (
                  <span className={`${styles.strainBadge} ${getStrainClass(product.strain_type)}`}>
                    {product.strain_type}
                  </span>
                )}
                <div className={styles.productMeta}>
                  <span className={styles.productPrice}>
                    ${(product.sale_price || product.price).toFixed(2)}
                  </span>
                  <span className={`${styles.productStock} ${getStockClass(product.stock_quantity)}`}>
                    {product.stock_quantity <= 0 ? 'Out of stock' : `${product.stock_quantity} left`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className={styles.cartSection}>
        <div className={styles.cartHeader}>
          <div className={styles.cartTitle}>
            🛒 Cart
            {cart.length > 0 && (
              <span className={styles.cartCount}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            )}
          </div>
          {cart.length > 0 && (
            <button className={styles.clearCart} onClick={clearCart}>
              Clear
            </button>
          )}
        </div>

        {/* Customer Selection */}
        <div className={styles.customerSection}>
          <label className={styles.customerLabel}>Customer (optional)</label>
          {selectedCustomer ? (
            <div className={styles.selectedCustomer}>
              <div>
                <div className={styles.customerName}>
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </div>
                <div className={styles.customerPoints}>
                  {selectedCustomer.loyalty_points || 0} loyalty points
                </div>
              </div>
              <button
                className={styles.removeCustomer}
                onClick={() => setSelectedCustomer(null)}
              >
                ✕
              </button>
            </div>
          ) : (
            <select
              className={styles.customerSelect}
              value=""
              onChange={(e) => {
                const customer = customers.find(c => c.id === parseInt(e.target.value));
                setSelectedCustomer(customer);
              }}
            >
              <option value="">-- Walk-in Customer --</option>
              {customers.filter(c => c.status === 'active').map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name} ({customer.loyalty_points || 0} pts)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Loyalty Points Redemption */}
        {selectedCustomer && selectedCustomer.loyalty_points > 0 && cart.length > 0 && (
          <div className={styles.redeemSection}>
            {!showRedeemInput ? (
              <button
                className={styles.redeemBtn}
                onClick={() => setShowRedeemInput(true)}
              >
                🎁 Redeem Points ({selectedCustomer.loyalty_points} available)
              </button>
            ) : (
              <div className={styles.redeemInputWrapper}>
                <label className={styles.redeemLabel}>Points to redeem (max {maxRedeemablePoints}):</label>
                <div className={styles.redeemControls}>
                  <input
                    type="number"
                    className={styles.redeemInput}
                    value={pointsToRedeem}
                    onChange={(e) => {
                      const val = Math.min(maxRedeemablePoints, Math.max(0, parseInt(e.target.value) || 0));
                      setPointsToRedeem(val);
                    }}
                    min="0"
                    max={maxRedeemablePoints}
                  />
                  <button
                    className={styles.redeemMaxBtn}
                    onClick={() => setPointsToRedeem(maxRedeemablePoints)}
                  >
                    Max
                  </button>
                  <button
                    className={styles.redeemCancelBtn}
                    onClick={() => {
                      setPointsToRedeem(0);
                      setShowRedeemInput(false);
                    }}
                  >
                    ✕
                  </button>
                </div>
                {pointsToRedeem > 0 && (
                  <div className={styles.redeemValue}>
                    Discount: -${pointsDiscount.toFixed(2)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cart Items */}
        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIcon}>🛒</div>
              <p>Cart is empty</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Click products to add them</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className={styles.cartItem}>
                <div className={styles.cartItemDetails}>
                  <div className={styles.cartItemName}>{item.name}</div>
                  <div className={styles.cartItemPrice}>
                    ${item.price.toFixed(2)} each
                  </div>
                </div>
                <div className={styles.cartItemControls}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.product_id, -1)}
                  >
                    −
                  </button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.product_id, 1)}
                  >
                    +
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.product_id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div className={styles.cartTotals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span className={styles.totalValue}>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Tax (7.75%)</span>
              <span className={styles.totalValue}>${taxAmount.toFixed(2)}</span>
            </div>
            {pointsToRedeem > 0 && (
              <div className={`${styles.totalRow} ${styles.discount}`}>
                <span>Points Discount ({pointsToRedeem} pts)</span>
                <span className={styles.discountValue}>-${pointsDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.grand}`}>
              <span>Total</span>
              <span className={styles.totalValue}>${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Payment */}
        <div className={styles.paymentSection}>
          <div className={styles.paymentMethods}>
            <button
              className={`${styles.paymentBtn} ${paymentMethod === 'cash' ? styles.active : ''}`}
              onClick={() => setPaymentMethod('cash')}
            >
              💵 Cash
            </button>
            <button
              className={`${styles.paymentBtn} ${paymentMethod === 'debit' ? styles.active : ''}`}
              onClick={() => setPaymentMethod('debit')}
            >
              💳 Debit
            </button>
          </div>
          <button
            className={styles.checkoutBtn}
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
          >
            {processing ? 'Processing...' : `Complete Sale - $${total.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <Modal title="Transaction Complete" onClose={closeReceipt}>
          <div className={styles.receiptModal}>
            <div className={styles.receiptIcon}>✅</div>
            <h2 className={styles.receiptTitle}>Sale Complete!</h2>
            <div className={styles.receiptNumber}>
              {receipt.transactionNumber}
            </div>
            <div className={styles.receiptTotal}>
              ${receipt.total.toFixed(2)}
            </div>
            {receipt.customer && (
              <p style={{ marginBottom: '1rem' }}>
                Customer: {receipt.customer.first_name} {receipt.customer.last_name}<br />
                <small>Points earned: {Math.floor(receipt.total)}</small>
              </p>
            )}
            <div className={styles.receiptActions}>
              <button className={`${styles.receiptBtn} ${styles.receiptBtnPrimary}`} onClick={closeReceipt}>
                New Sale
              </button>
              <button className={`${styles.receiptBtn} ${styles.receiptBtnSecondary}`} onClick={closeReceipt}>
                Print Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default POS;
