import { PullToRefresh } from 'antd-mobile';
import styles from './MobilePullToRefresh.module.css';

/**
 * MobilePullToRefresh - Mobile pull-to-refresh wrapper
 * Shows only on mobile (<640px), wraps content in PullToRefresh
 */
function MobilePullToRefresh({ children, onRefresh, disabled = false }) {
  const handleRefresh = async () => {
    // Haptic feedback at start
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    await onRefresh();
    // Haptic feedback on complete
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  };

  return (
    <div className={styles.pullToRefreshWrapper}>
      <PullToRefresh
        onRefresh={handleRefresh}
        disabled={disabled}
        pullingText={
          <div className={styles.pullText}>
            <span className={styles.pullIcon}>↓</span>
            <span>Pull to refresh</span>
          </div>
        }
        canReleaseText={
          <div className={styles.pullText}>
            <span className={styles.releaseIcon}>↑</span>
            <span>Release to refresh</span>
          </div>
        }
        refreshingText={
          <div className={styles.pullText}>
            <span className={styles.loadingIcon}>⟳</span>
            <span>Loading...</span>
          </div>
        }
        completeText={
          <div className={styles.pullText}>
            <span className={styles.completeIcon}>✓</span>
            <span>Updated</span>
          </div>
        }
      >
        {children}
      </PullToRefresh>
    </div>
  );
}

export default MobilePullToRefresh;
