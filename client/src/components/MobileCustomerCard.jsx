import { SwipeAction, Tag } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import styles from './MobileCustomerCard.module.css';

/**
 * MobileCustomerCard - Card-based customer profile for mobile viewing
 * Features:
 * - Compact card layout showing key customer info
 * - Quick action buttons (call, message)
 * - Swipe to reveal edit/delete actions
 */
function MobileCustomerCard({
  customer,
  onEdit,
  onDelete,
  onView
}) {
  const navigate = useNavigate();

  // Handle phone call
  const handleCall = (e) => {
    e.stopPropagation();
    if (customer.phone) {
      // Clean phone number for tel: link
      const cleanPhone = customer.phone.replace(/[^0-9+]/g, '');
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  // Handle SMS message
  const handleMessage = (e) => {
    e.stopPropagation();
    if (customer.phone) {
      const cleanPhone = customer.phone.replace(/[^0-9+]/g, '');
      window.location.href = `sms:${cleanPhone}`;
    }
  };

  // Handle card click - navigate to detail view
  const handleCardClick = () => {
    if (onView) {
      onView(customer.id);
    } else {
      navigate(`/customers/${customer.id}`);
    }
  };

  // Get loyalty tier color
  const getLoyaltyColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'platinum':
        return '#8B8B8B';
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      default:
        return '#CD7F32'; // bronze
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'vip':
        return '#B57EDC';
      case 'new':
        return '#2196F3';
      case 'inactive':
        return '#9E9E9E';
      default:
        return '#4CAF50';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Swipe actions - right side (revealed on left swipe)
  const rightActions = [
    {
      key: 'edit',
      text: 'Edit',
      color: '#B57EDC',
      onClick: () => {
        if (onEdit) {
          onEdit(customer.id);
        } else {
          navigate(`/customers/${customer.id}/edit`);
        }
      }
    },
    {
      key: 'delete',
      text: 'Delete',
      color: '#E74C3C',
      onClick: () => {
        if (onDelete) {
          onDelete(customer);
        }
      }
    }
  ];

  // Left swipe action - quick view
  const leftActions = [
    {
      key: 'view',
      text: 'View',
      color: '#7B4A9E',
      onClick: handleCardClick
    }
  ];

  return (
    <SwipeAction
      rightActions={rightActions}
      leftActions={leftActions}
      className={styles.swipeContainer}
    >
      <div className={styles.card} onClick={handleCardClick}>
        {/* Avatar with initials */}
        <div className={styles.avatar}>
          <span className={styles.initials}>
            {(customer.firstName?.[0] || '?')}{(customer.lastName?.[0] || '')}
          </span>
        </div>

        {/* Customer info */}
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>
              {customer.firstName} {customer.lastName}
            </span>
            <Tag
              color={getStatusColor(customer.status)}
              className={styles.statusTag}
            >
              {customer.status}
            </Tag>
          </div>

          <div className={styles.contactRow}>
            {customer.phone && (
              <span className={styles.phone}>{customer.phone}</span>
            )}
            {customer.email && (
              <span className={styles.email}>{customer.email}</span>
            )}
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span
                className={styles.loyaltyBadge}
                style={{ backgroundColor: getLoyaltyColor(customer.loyaltyTier) }}
              >
                {customer.loyaltyTier || 'Bronze'}
              </span>
              <span className={styles.points}>
                {customer.loyaltyPoints || 0} pts
              </span>
            </div>
            <span className={styles.totalSpent}>
              {formatCurrency(customer.totalPurchases)} spent
            </span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className={styles.actions}>
          {customer.phone && (
            <>
              <button
                className={styles.actionButton}
                onClick={handleCall}
                title="Call customer"
                aria-label="Call customer"
              >
                <span className={styles.actionIcon}>📞</span>
              </button>
              <button
                className={styles.actionButton}
                onClick={handleMessage}
                title="Send SMS"
                aria-label="Send SMS message"
              >
                <span className={styles.actionIcon}>💬</span>
              </button>
            </>
          )}
        </div>
      </div>
    </SwipeAction>
  );
}

export default MobileCustomerCard;
