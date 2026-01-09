import { Grid } from 'antd-mobile';
import styles from './MobilePOSGrid.module.css';

/**
 * MobilePOSGrid - Touch-optimized product grid for POS on mobile
 * Uses antd-mobile Grid with 3 columns on phone, 4 on tablet
 * All touch targets are minimum 44px
 */
function MobilePOSGrid({ products, categories, onAddToCart }) {
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

  // Get strain badge style
  const getStrainClass = (strain) => {
    switch (strain?.toLowerCase()) {
      case 'indica': return styles.indica;
      case 'sativa': return styles.sativa;
      case 'hybrid': return styles.hybrid;
      case 'cbd': return styles.cbd;
      default: return '';
    }
  };

  const handleTap = (product) => {
    if (product.stock_quantity > 0 && onAddToCart) {
      onAddToCart(product);
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📦</div>
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className={styles.mobileGridWrapper}>
      <Grid columns={3} gap={8}>
        {products.map((product) => (
          <Grid.Item key={product.id}>
            <div
              className={`${styles.productCard} ${product.stock_quantity <= 0 ? styles.outOfStock : ''}`}
              onClick={() => handleTap(product)}
              role="button"
              tabIndex={0}
              aria-label={`Add ${product.name} to cart`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleTap(product);
                }
              }}
            >
              <div className={styles.productEmoji}>
                {getCategoryEmoji(product.category_id)}
              </div>
              <div className={styles.productName}>
                {product.name}
              </div>
              {product.strain_type && (
                <span className={`${styles.strainBadge} ${getStrainClass(product.strain_type)}`}>
                  {product.strain_type}
                </span>
              )}
              <div className={styles.productPrice}>
                ${(product.sale_price || product.price).toFixed(2)}
              </div>
              <div className={`${styles.stockBadge} ${product.stock_quantity <= 0 ? styles.outOfStockBadge : product.stock_quantity <= 5 ? styles.lowStock : ''}`}>
                {product.stock_quantity <= 0 ? 'Out' : `${product.stock_quantity}`}
              </div>
            </div>
          </Grid.Item>
        ))}
      </Grid>
    </div>
  );
}

export default MobilePOSGrid;
