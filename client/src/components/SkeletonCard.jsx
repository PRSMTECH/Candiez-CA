import { Skeleton } from 'antd-mobile';
import styles from './SkeletonCard.module.css';

/**
 * SkeletonCard - Skeleton loading state for customer/product cards
 * Matches the dimensions of MobileCustomerCard for smooth transitions
 */
function SkeletonCard({ variant = 'customer' }) {
  if (variant === 'product') {
    return (
      <div className={styles.card}>
        {/* Product image placeholder */}
        <Skeleton animated className={styles.productImage} />
        <div className={styles.info}>
          <Skeleton.Title animated className={styles.title} />
          <Skeleton.Paragraph lineCount={2} animated className={styles.details} />
          <div className={styles.priceRow}>
            <Skeleton animated className={styles.price} />
            <Skeleton animated className={styles.badge} />
          </div>
        </div>
      </div>
    );
  }

  // Default: customer card skeleton
  return (
    <div className={styles.card}>
      {/* Avatar placeholder */}
      <Skeleton animated className={styles.avatar} />

      {/* Customer info skeleton */}
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <Skeleton.Title animated className={styles.name} />
          <Skeleton animated className={styles.statusBadge} />
        </div>
        <Skeleton.Paragraph lineCount={2} animated className={styles.contact} />
        <div className={styles.statsRow}>
          <Skeleton animated className={styles.loyaltyBadge} />
          <Skeleton animated className={styles.points} />
          <Skeleton animated className={styles.spent} />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className={styles.actions}>
        <Skeleton animated className={styles.actionButton} />
        <Skeleton animated className={styles.actionButton} />
      </div>
    </div>
  );
}

export default SkeletonCard;
