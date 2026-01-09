import { FloatingBubble } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import styles from './MobileFloatingAction.module.css';

/**
 * MobileFloatingAction - Floating action button for quick-add actions
 * Positioned above the TabBar, only visible on mobile
 */
function MobileFloatingAction({
  icon = '+',
  label = 'Add',
  onClick,
  to, // Optional navigation path
  offset = { x: -24, y: -80 }, // Position offset (above TabBar)
  disabled = false
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <div className={styles.floatingWrapper}>
      <FloatingBubble
        style={{
          '--initial-position-bottom': '80px',
          '--initial-position-right': '24px',
          '--edge-distance': '24px',
          '--background': 'linear-gradient(135deg, #B57EDC 0%, #7B4A9E 100%)',
          '--size': '56px',
        }}
        offset={offset}
        onClick={handleClick}
        className={`${styles.floatingBubble} ${disabled ? styles.disabled : ''}`}
      >
        <span className={styles.bubbleContent}>
          <span className={styles.icon}>{icon}</span>
          {label && <span className={styles.label}>{label}</span>}
        </span>
      </FloatingBubble>
    </div>
  );
}

export default MobileFloatingAction;
