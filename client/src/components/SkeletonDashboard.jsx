import { Skeleton } from 'antd-mobile';
import styles from './SkeletonDashboard.module.css';

/**
 * SkeletonDashboard - Skeleton loading state for dashboard
 * Shows placeholders for stats cards and recent activity
 */
function SkeletonDashboard() {
  return (
    <div className={styles.container}>
      {/* Header skeleton */}
      <div className={styles.header}>
        <Skeleton.Title animated className={styles.greeting} />
        <Skeleton.Paragraph lineCount={1} animated className={styles.subtitle} />
      </div>

      {/* Stats cards skeleton */}
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.statCard}>
            <Skeleton animated className={styles.statIcon} />
            <div className={styles.statInfo}>
              <Skeleton.Title animated className={styles.statValue} />
              <Skeleton animated className={styles.statLabel} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className={styles.quickActions}>
        <Skeleton.Title animated className={styles.sectionTitle} />
        <div className={styles.actionButtons}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} animated className={styles.actionButton} />
          ))}
        </div>
      </div>

      {/* Recent activity skeleton */}
      <div className={styles.recentSection}>
        <Skeleton.Title animated className={styles.sectionTitle} />
        <div className={styles.activityList}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.activityItem}>
              <Skeleton animated className={styles.activityIcon} />
              <div className={styles.activityInfo}>
                <Skeleton.Title animated className={styles.activityTitle} />
                <Skeleton animated className={styles.activityTime} />
              </div>
              <Skeleton animated className={styles.activityAmount} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkeletonDashboard;
