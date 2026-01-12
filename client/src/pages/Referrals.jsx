import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import ShareToolsModal from '../components/referrals/ShareToolsModal';
import styles from './Referrals.module.css';

function Referrals() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('network');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');

  // Dashboard data
  const [dashboard, setDashboard] = useState(null);
  const [network, setNetwork] = useState({ referrals: [], pagination: {} });
  const [earnings, setEarnings] = useState({ earnings: [], summary: {}, pagination: {} });
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchTiers();
  }, []);

  useEffect(() => {
    if (activeTab === 'network') {
      fetchNetwork();
    } else if (activeTab === 'earnings') {
      fetchEarnings();
    }
  }, [activeTab]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/referrals/dashboard', { headers: getAuthHeaders() });
      setDashboard(res.data);
    } catch (err) {
      setError('Failed to load referral dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetwork = async () => {
    try {
      const res = await axios.get('/api/referrals/network', { headers: getAuthHeaders() });
      setNetwork(res.data);
    } catch (err) {
      console.error('Failed to fetch network:', err);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await axios.get('/api/referrals/earnings', { headers: getAuthHeaders() });
      setEarnings(res.data);
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    }
  };

  const fetchTiers = async () => {
    try {
      const res = await axios.get('/api/referrals/tiers', { headers: getAuthHeaders() });
      setTiers(res.data.tiers);
    } catch (err) {
      console.error('Failed to fetch tiers:', err);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard!`);
  };

  const handleRedeem = async () => {
    const amount = parseFloat(redeemAmount);
    if (!amount || amount <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    if (amount > (dashboard?.stats?.available_balance || 0)) {
      showError('Amount exceeds available balance');
      return;
    }

    try {
      await axios.post('/api/referrals/redeem', {
        amount,
        payout_type: 'store_credit'
      }, { headers: getAuthHeaders() });

      success(`$${amount.toFixed(2)} redeemed as store credit!`);
      setShowRedeemModal(false);
      setRedeemAmount('');
      fetchDashboardData();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to process redemption');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (!dashboard?.next_tier) return 100;
    const currentTier = tiers.find(t => t.tier_name === dashboard.current_tier.name);
    const nextTier = tiers.find(t => t.tier_name === dashboard.next_tier.name);

    if (!currentTier || !nextTier) return 0;

    const referralProgress = (dashboard.tier_progress.referrals / nextTier.min_referrals) * 50;
    const salesProgress = (dashboard.tier_progress.sales / nextTier.min_sales) * 50;

    return Math.min(100, referralProgress + salesProgress);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading referral dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Ambassador Program</h1>
        <p className={styles.subtitle}>
          Share your code, earn commissions on every purchase your referrals make
        </p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Referral Code Card */}
      <div className={styles.codeCard}>
        <div className={styles.codeHeader}>
          <h2>Your Referral Code</h2>
          <span className={styles.tierBadge}>{dashboard?.current_tier?.name || 'Member'}</span>
        </div>
        <div className={styles.codeDisplay}>
          <span className={styles.code}>{dashboard?.referral_code || 'N/A'}</span>
          <button
            className={styles.copyBtn}
            onClick={() => copyToClipboard(dashboard?.referral_code, 'Code')}
          >
            Copy Code
          </button>
        </div>
        <div className={styles.linkSection}>
          <input
            type="text"
            className={styles.linkInput}
            value={dashboard?.referral_link || ''}
            readOnly
          />
          <button
            className={styles.linkBtn}
            onClick={() => copyToClipboard(dashboard?.referral_link, 'Link')}
          >
            Copy Link
          </button>
          <button
            className={styles.shareBtn}
            onClick={() => setShowShareModal(true)}
          >
            Share
          </button>
        </div>
        <p className={styles.commissionRate}>
          Earn {((dashboard?.current_tier?.commission_rate || 0.05) * 100).toFixed(1)}% commission on all referred purchases
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Referrals</h3>
          <p className={styles.statValue}>{dashboard?.stats?.total_referrals || 0}</p>
          <span className={styles.statLabel}>{dashboard?.stats?.active_referrals || 0} active</span>
        </div>
        <div className={`${styles.statCard} ${styles.earnings}`}>
          <h3>Total Earnings</h3>
          <p className={styles.statValue}>{formatCurrency(dashboard?.stats?.total_earnings)}</p>
          <span className={styles.statLabel}>lifetime</span>
        </div>
        <div className={`${styles.statCard} ${styles.earnings}`}>
          <h3>Available Balance</h3>
          <p className={styles.statValue}>{formatCurrency(dashboard?.stats?.available_balance)}</p>
          <span className={styles.statLabel}>to redeem</span>
        </div>
        <div className={styles.statCard}>
          <h3>Commission Rate</h3>
          <p className={styles.statValue}>{((dashboard?.current_tier?.commission_rate || 0.05) * 100).toFixed(1)}%</p>
          <span className={styles.statLabel}>{dashboard?.current_tier?.name || 'Member'} tier</span>
        </div>
      </div>

      {/* Tier Progress */}
      {dashboard?.next_tier && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <h3>Progress to {dashboard.next_tier.name}</h3>
            <span className={styles.nextTier}>
              {((dashboard.next_tier.commission_rate || 0) * 100).toFixed(1)}% commission rate
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          <div className={styles.progressMetrics}>
            <span>
              Referrals: <strong>{dashboard.tier_progress.referrals}</strong> /
              {tiers.find(t => t.tier_name === dashboard.next_tier.name)?.min_referrals || '?'}
            </span>
            <span>
              Sales: <strong>{formatCurrency(dashboard.tier_progress.sales)}</strong> /
              {formatCurrency(tiers.find(t => t.tier_name === dashboard.next_tier.name)?.min_sales)}
            </span>
          </div>
        </div>
      )}

      {/* Earnings Card with Redeem */}
      <div className={styles.earningsCard}>
        <div className={styles.earningsHeader}>
          <h3>Available to Redeem</h3>
        </div>
        <div className={styles.balanceDisplay}>
          <span className={styles.balanceAmount}>
            {formatCurrency(dashboard?.stats?.available_balance)}
          </span>
          <button
            className={styles.redeemBtn}
            onClick={() => setShowRedeemModal(true)}
            disabled={!dashboard?.stats?.available_balance || dashboard.stats.available_balance <= 0}
          >
            Redeem for Store Credit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'network' ? styles.active : ''}`}
          onClick={() => setActiveTab('network')}
        >
          My Network
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'earnings' ? styles.active : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          Earnings History
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tiers' ? styles.active : ''}`}
          onClick={() => setActiveTab('tiers')}
        >
          Tier Benefits
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'network' && (
        <div className={styles.dataCard}>
          {network.referrals.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No referrals yet</p>
              <p>Share your referral code to start earning!</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Joined</th>
                  <th>Purchases</th>
                  <th>Total Spent</th>
                  <th>Commission Earned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {network.referrals.map(ref => (
                  <tr key={ref.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className={styles.avatar}>{ref.initials}</div>
                        <span>{ref.name}</span>
                      </div>
                    </td>
                    <td>{formatDate(ref.joined_at)}</td>
                    <td>{ref.purchase_count}</td>
                    <td>{formatCurrency(ref.total_spent)}</td>
                    <td className={styles.amountPositive}>{formatCurrency(ref.commission_earned)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${ref.status === 'active' ? styles.active : styles.inactive}`}>
                        {ref.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className={styles.dataCard}>
          {earnings.earnings.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No earnings yet</p>
              <p>You'll see your commission history here once your referrals make purchases.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {earnings.earnings.map(e => (
                  <tr key={e.id}>
                    <td>{formatDate(e.created_at)}</td>
                    <td>{e.type.replace('_', ' ')}</td>
                    <td>{e.customer_name || '-'}</td>
                    <td>{e.description}</td>
                    <td className={e.amount >= 0 ? styles.amountPositive : styles.amountNegative}>
                      {e.amount >= 0 ? '+' : ''}{formatCurrency(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'tiers' && (
        <div className={styles.dataCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Commission Rate</th>
                <th>Min Referrals</th>
                <th>Min Sales</th>
                <th>Signup Bonus</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map(tier => (
                <tr key={tier.tier_name} style={{
                  background: tier.tier_name === dashboard?.current_tier?.name ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
                }}>
                  <td>
                    <strong>{tier.tier_name}</strong>
                    {tier.tier_name === dashboard?.current_tier?.name && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                        (Current)
                      </span>
                    )}
                  </td>
                  <td>{(tier.commission_rate * 100).toFixed(1)}%</td>
                  <td>{tier.min_referrals}</td>
                  <td>{formatCurrency(tier.min_sales)}</td>
                  <td>{tier.signup_bonus_points} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className={styles.modal} onClick={() => setShowRedeemModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Redeem Balance</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
              Available: {formatCurrency(dashboard?.stats?.available_balance)}
            </p>
            <input
              type="number"
              placeholder="Enter amount to redeem"
              value={redeemAmount}
              onChange={e => setRedeemAmount(e.target.value)}
              max={dashboard?.stats?.available_balance || 0}
              min="0"
              step="0.01"
            />
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => setShowRedeemModal(false)}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={handleRedeem}>
                Redeem as Store Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Tools Modal */}
      <ShareToolsModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        referralCode={dashboard?.referral_code || ''}
        referralLink={dashboard?.referral_link || ''}
      />
    </div>
  );
}

export default Referrals;
