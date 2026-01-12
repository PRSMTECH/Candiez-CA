import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import axios from 'axios';
import styles from './ReferralAdmin.module.css';

function ReferralAdmin() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Data
  const [analytics, setAnalytics] = useState(null);
  const [payouts, setPayouts] = useState({ payouts: [], pagination: {} });
  const [tiers, setTiers] = useState([]);
  const [payoutFilter, setPayoutFilter] = useState('');

  useEffect(() => {
    fetchAnalytics();
    fetchTiers();
  }, []);

  useEffect(() => {
    if (activeTab === 'payouts') {
      fetchPayouts();
    }
  }, [activeTab, payoutFilter]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/referrals/analytics', { headers: getAuthHeaders() });
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      showError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      const params = new URLSearchParams();
      if (payoutFilter) params.append('status', payoutFilter);

      const res = await axios.get(`/api/admin/referrals/payouts?${params}`, { headers: getAuthHeaders() });
      setPayouts(res.data);
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    }
  };

  const fetchTiers = async () => {
    try {
      const res = await axios.get('/api/admin/referrals/tiers', { headers: getAuthHeaders() });
      setTiers(res.data.tiers);
    } catch (err) {
      console.error('Failed to fetch tiers:', err);
    }
  };

  const updatePayoutStatus = async (payoutId, newStatus) => {
    try {
      await axios.put(`/api/admin/referrals/payouts/${payoutId}`, {
        status: newStatus
      }, { headers: getAuthHeaders() });

      success(`Payout ${newStatus}`);
      fetchPayouts();
      fetchAnalytics();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update payout');
    }
  };

  const updateTier = async (tierId, updates) => {
    try {
      await axios.put(`/api/admin/referrals/tiers/${tierId}`, updates, { headers: getAuthHeaders() });
      success('Tier updated');
      fetchTiers();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update tier');
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading referral analytics...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Ambassador Program Admin</h1>
        <p className={styles.subtitle}>
          Manage referral program, approve payouts, and configure tiers
        </p>
      </div>

      {/* Overview Stats */}
      {analytics && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Ambassadors</h3>
            <p className={styles.statValue}>{analytics.overview.total_ambassadors}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Active Referrals</h3>
            <p className={styles.statValue}>{analytics.overview.active_referrals}</p>
            <span className={styles.statLabel}>of {analytics.overview.total_referrals} total</span>
          </div>
          <div className={`${styles.statCard} ${styles.earnings}`}>
            <h3>Total Commissions Paid</h3>
            <p className={styles.statValue}>{formatCurrency(analytics.overview.total_commissions)}</p>
          </div>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <h3>Pending Payouts</h3>
            <p className={styles.statValue}>{formatCurrency(analytics.overview.pending_payouts)}</p>
            <span className={styles.statLabel}>{analytics.overview.pending_payouts_count} requests</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'payouts' ? styles.active : ''}`}
          onClick={() => setActiveTab('payouts')}
        >
          Payouts
          {analytics?.overview?.pending_payouts_count > 0 && (
            <span className={styles.badge}>{analytics.overview.pending_payouts_count}</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tiers' ? styles.active : ''}`}
          onClick={() => setActiveTab('tiers')}
        >
          Tier Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && analytics && (
        <div className={styles.overviewTab}>
          {/* Top Performers */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Top Performers</h3>
            <div className={styles.dataCard}>
              {analytics.top_performers.length === 0 ? (
                <p className={styles.emptyState}>No ambassador activity yet</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Ambassador</th>
                      <th>Tier</th>
                      <th>Referrals</th>
                      <th>Total Sales</th>
                      <th>Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.top_performers.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className={styles.ambassadorCell}>
                            <div className={styles.avatar}>{p.initials}</div>
                            <div>
                              <span className={styles.name}>{p.name}</span>
                              <span className={styles.code}>{p.referral_code}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.tierBadge}>{p.tier}</span>
                        </td>
                        <td>{p.referral_count}</td>
                        <td>{formatCurrency(p.total_sales)}</td>
                        <td className={styles.earnings}>{formatCurrency(p.total_earnings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Tier Distribution */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Tier Distribution</h3>
            <div className={styles.tierDistribution}>
              {analytics.tier_distribution.map((t) => (
                <div key={t.tier} className={styles.tierBar}>
                  <span className={styles.tierName}>{t.tier}</span>
                  <div className={styles.barContainer}>
                    <div
                      className={styles.bar}
                      style={{
                        width: `${(t.count / analytics.overview.total_ambassadors) * 100}%`
                      }}
                    />
                  </div>
                  <span className={styles.tierCount}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Commissions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Recent Commissions</h3>
            <div className={styles.dataCard}>
              {analytics.recent_commissions.length === 0 ? (
                <p className={styles.emptyState}>No commissions yet</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Ambassador</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recent_commissions.map((c) => (
                      <tr key={c.id}>
                        <td>{formatDate(c.created_at)}</td>
                        <td>{c.ambassador_name}</td>
                        <td>{c.description}</td>
                        <td className={styles.earnings}>{formatCurrency(c.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className={styles.payoutsTab}>
          <div className={styles.filterBar}>
            <select
              value={payoutFilter}
              onChange={(e) => setPayoutFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Payouts</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className={styles.dataCard}>
            {payouts.payouts.length === 0 ? (
              <p className={styles.emptyState}>No payout requests</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Ambassador</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.payouts.map((p) => (
                    <tr key={p.id}>
                      <td>{formatDate(p.created_at)}</td>
                      <td>
                        <div>
                          <span className={styles.name}>{p.user_name}</span>
                          <span className={styles.email}>{p.email}</span>
                        </div>
                      </td>
                      <td className={styles.earnings}>{formatCurrency(p.amount)}</td>
                      <td>{p.payout_type}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {p.status === 'pending' && user?.role === 'admin' && (
                          <div className={styles.actionButtons}>
                            <button
                              className={styles.approveBtn}
                              onClick={() => updatePayoutStatus(p.id, 'approved')}
                            >
                              Approve
                            </button>
                            <button
                              className={styles.cancelBtn}
                              onClick={() => updatePayoutStatus(p.id, 'cancelled')}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {p.status === 'approved' && user?.role === 'admin' && (
                          <button
                            className={styles.paidBtn}
                            onClick={() => updatePayoutStatus(p.id, 'paid')}
                          >
                            Mark Paid
                          </button>
                        )}
                        {p.approved_by_name && (
                          <span className={styles.approvedBy}>
                            by {p.approved_by_name}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tiers' && (
        <div className={styles.tiersTab}>
          <div className={styles.dataCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tier Name</th>
                  <th>Min Referrals</th>
                  <th>Min Sales</th>
                  <th>Commission Rate</th>
                  <th>Signup Bonus</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.id}>
                    <td><strong>{tier.tier_name}</strong></td>
                    <td>{tier.min_referrals}</td>
                    <td>{formatCurrency(tier.min_sales)}</td>
                    <td>{(tier.commission_rate * 100).toFixed(1)}%</td>
                    <td>{tier.signup_bonus_points} pts</td>
                    <td>
                      <span className={`${styles.statusBadge} ${tier.is_active ? styles.active : styles.inactive}`}>
                        {tier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user?.role === 'admin' && (
                        <button
                          className={styles.editBtn}
                          onClick={() => {
                            const newRate = prompt('Enter new commission rate (e.g., 0.10 for 10%):', tier.commission_rate);
                            if (newRate !== null) {
                              updateTier(tier.id, { commission_rate: parseFloat(newRate) });
                            }
                          }}
                        >
                          Edit Rate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.tierNote}>
            <strong>Note:</strong> Commission rates apply to product subtotals (before tax).
            Users automatically upgrade tiers when they meet requirements.
          </div>
        </div>
      )}
    </div>
  );
}

export default ReferralAdmin;
