import SkeletonCard from './SkeletonCard';
import styles from './SkeletonList.module.css';

/**
 * SkeletonList - Skeleton loading state for lists
 * Renders multiple skeleton cards to simulate loading content
 */
function SkeletonList({
  count = 5,
  variant = 'customer'
}) {
  return (
    <div className={styles.list}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} variant={variant} />
      ))}
    </div>
  );
}

export default SkeletonList;
