import { useState, useEffect } from 'react';
import styles from './AnimatedLogo.module.css';

// Logo URLs from Supabase storage
const LOGO_PRIMARY = 'https://hhdmovjjvlfkspqrzsjz.supabase.co/storage/v1/object/public/public-media/candiez/images/logos/official-logo.png';
const LOGO_SECONDARY = 'https://hhdmovjjvlfkspqrzsjz.supabase.co/storage/v1/object/public/public-media/candiez/images/logos/Candiez2-logo.png';

function AnimatedLogo({
  size = 'medium',
  showText = true,
  animationInterval = 4000,
  className = ''
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Cycle between logos
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % 2);
        setIsAnimating(false);
      }, 600); // Half of the transition duration

    }, animationInterval);

    return () => clearInterval(interval);
  }, [animationInterval]);

  const logos = [LOGO_PRIMARY, LOGO_SECONDARY];

  const sizeClasses = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
    xlarge: styles.sizeXLarge
  };

  return (
    <div className={`${styles.logoContainer} ${sizeClasses[size]} ${className}`}>
      <div className={`${styles.logoWrapper} ${isAnimating ? styles.animating : ''}`}>
        {/* Primary Logo Layer */}
        <div
          className={`${styles.logoLayer} ${activeIndex === 0 ? styles.active : styles.inactive}`}
        >
          <img
            src={LOGO_PRIMARY}
            alt="Candiez Logo"
            className={styles.logoImage}
          />
        </div>

        {/* Secondary Logo Layer */}
        <div
          className={`${styles.logoLayer} ${activeIndex === 1 ? styles.active : styles.inactive}`}
        >
          <img
            src={LOGO_SECONDARY}
            alt="Candiez Logo Alt"
            className={styles.logoImage}
          />
        </div>

        {/* Shimmer Effect */}
        <div className={styles.shimmer}></div>

        {/* Glow Effect */}
        <div className={styles.glow}></div>
      </div>

      {showText && (
        <span className={styles.logoText}>Candiez</span>
      )}
    </div>
  );
}

export default AnimatedLogo;
