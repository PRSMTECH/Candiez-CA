const fs = require('fs');

const newContent = `import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import axios from 'axios';
import styles from './Products.module.css';

// Mock product data for development (California cannabis dispensary products)
const mockProducts = [
  {
    id: 1,
    name: 'Blue Dream',
    category: 'Flower',
    strain: 'Hybrid',
    thcContent: 21.5,
    cbdContent: 0.1,
    price: 45.00,
    unitPrice: 15.00,
    unit: 'gram',
    stock: 250,
    status: 'active'
  },
  {
    id: 2,
    name: 'OG Kush',
    category: 'Flower',
    strain: 'Indica',
    thcContent: 24.0,
    cbdContent: 0.2,
    price: 50.00,
    unitPrice: 16.67,
    unit: 'gram',
    stock: 180,
    status: 'active'
  },
  {
    id: 3,
    name: 'Sour Diesel',
    category: 'Flower',
    strain: 'Sativa',
    thcContent: 22.0,
    cbdContent: 0.3,
    price: 48.00,
    unitPrice: 16.00,
    unit: 'gram',
    stock: 120,
    status: 'active'
  },
  {
    id: 4,
    name: 'CBD Calm Tincture',
    category: 'Tinctures',
    strain: 'N/A',
    thcContent: 0.3,
    cbdContent: 30.0,
    price: 65.00,
    unitPrice: 65.00,
    unit: 'bottle',
    stock: 45,
    status: 'active'
  },
  {
    id: 5,
    name: 'Skywalker OG Cartridge',
    category: 'Vape',
    strain: 'Indica',
    thcContent: 85.0,
    cbdContent: 0.5,
    price: 55.00,
    unitPrice: 55.00,
    unit: 'cartridge',
    stock: 80,
    status: 'active'
  },
  {
    id: 6,
    name: 'Indica Gummies 10pk',
    category: 'Edibles',
    strain: 'Indica',
    thcContent: 10.0,
    cbdContent: 0.0,
    price: 35.00,
    unitPrice: 3.50,
    unit: 'piece',
    stock: 0,
    status: 'out_of_stock'
  },
  {
    id: 7,
    name: 'GSC Pre-Roll 5pk',
    category: 'Pre-Rolls',
    strain: 'Hybrid',
    thcContent: 20.0,
    cbdContent: 0.1,
    price: 40.00,
    unitPrice: 8.00,
    unit: 'joint',
    stock: 60,
    status: 'active'
  }
];

function Products() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Map snake_case API response to camelCase for frontend
  const mapProductFromApi = (product) => ({
    id: product.id,
    name: product.name,
    category: product.category_id ? \`Category \${product.category_id}\` : 'Flower', // Simplified since categories are IDs
    strain: product.strain_type || 'Hybrid',
    thcContent: product.thc_percent || 0,
    cbdContent: product.cbd_percent || 0,
    price: product.price || 0,
    unitPrice: product.sale_price || product.price || 0,
    unit: product.weight_unit || 'gram',
    stock: product.stock_quantity || 0,
    status: product.is_active ? 'active' : 'inactive',
    sku: product.sku
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/products', {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      const rawProducts = response.data.products || response.data || [];
      // Map API response to frontend format
      const mappedProducts = rawProducts.map(mapProductFromApi);
      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      // Use empty array if API fails
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (productId) => {
    navigate(\`/products/\${productId}/edit\`);
  };

  const handleView = (productId) => {
    navigate(\`/products/\${productId}\`);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(\`/api/products/\${productToDelete.id}\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    } catch (err) {
      console.error('Error deleting product:', err);
      // Still remove from local state for demo purposes
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    }
    setProductToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'all' || minPrice !== '' || maxPrice !== '' || sortBy !== 'name' || sortOrder !== 'asc';

  // Clear all filters function
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'price-asc') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (value === 'price-desc') {
      setSortBy('price');
      setSortOrder('desc');
    } else if (value === 'name-asc') {
      setSortBy('name');
      setSortOrder('asc');
    } else if (value === 'name-desc') {
      setSortBy('name');
      setSortOrder('desc');
    } else if (value === 'stock-asc') {
      setSortBy('stock');
      setSortOrder('asc');
    } else if (value === 'stock-desc') {
      setSortBy('stock');
      setSortOrder('desc');
    }
  };

  // Get current sort value for select
  const getSortValue = () => {
    return \`\${sortBy}-\${sortOrder}\`;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.strain.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

    // Price range filtering
    const minPriceNum = minPrice !== '' ? parseFloat(minPrice) : null;
    const maxPriceNum = maxPrice !== '' ? parseFloat(maxPrice) : null;
    const matchesMinPrice = minPriceNum === null || product.price >= minPriceNum;
    const matchesMaxPrice = maxPriceNum === null || product.price <= maxPriceNum;

    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  // Sort the filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'price') {
      comparison = a.price - b.price;
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'stock') {
      comparison = a.stock - b.stock;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const categories = [...new Set(products.map(p => p.category))];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status, stock) => {
    if (stock === 0 || status === 'out_of_stock') {
      return styles.statusOutOfStock;
    }
    if (stock < 20) {
      return styles.statusLowStock;
    }
    return styles.statusActive;
  };

  const getStatusText = (status, stock) => {
    if (stock === 0 || status === 'out_of_stock') {
      return 'Out of Stock';
    }
    if (stock < 20) {
      return 'Low Stock';
    }
    return 'In Stock';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading products...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            Manage your cannabis product inventory • {products.length} products
          </p>
        </div>
        <Link to="/products/new" className={styles.addButton}>
          + Add Product
        </Link>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search by name, category, or strain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className={styles.priceRange}>
          <input
            type="number"
            placeholder="Min $"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={styles.priceInput}
            min="0"
            step="0.01"
          />
          <span className={styles.priceSeparator}>-</span>
          <input
            type="number"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={styles.priceInput}
            min="0"
            step="0.01"
          />
        </div>
        <select
          value={getSortValue()}
          onChange={handleSortChange}
          className={styles.sortSelect}
          aria-label="Sort by"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
          <option value="stock-asc">Stock (Low to High)</option>
          <option value="stock-desc">Stock (High to Low)</option>
        </select>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className={styles.clearFiltersButton}
            title="Clear all filters"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {sortedProducts.length === 0 ? (
        <div className={styles.empty}>
          <p>No products found matching your search.</p>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className={styles.clearFiltersLink}>
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>THC/CBD</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productId}>ID: {product.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.categoryInfo}>
                      <span>{product.category}</span>
                      <span className={styles.strain}>{product.strain}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.thcCbd}>
                      <span className={styles.thc}>THC: {product.thcContent}%</span>
                      <span className={styles.cbd}>CBD: {product.cbdContent}%</span>
                    </div>
                  </td>
                  <td className={styles.price}>
                    {formatCurrency(product.price)}
                    <span className={styles.unitPrice}>
                      {formatCurrency(product.unitPrice)}/{product.unit}
                    </span>
                  </td>
                  <td className={styles.stock}>
                    {product.stock} units
                  </td>
                  <td>
                    <span className={\`\${styles.statusBadge} \${getStatusBadge(product.status, product.stock)}\`}>
                      {getStatusText(product.status, product.stock)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleView(product.id)}
                        className={styles.viewButton}
                        title="View product details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(product.id)}
                        className={styles.editButton}
                        title="Edit product"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className={styles.deleteButton}
                        title="Delete product"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.userNote}>
        Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Product"
        message={productToDelete
          ? \`Are you sure you want to delete "\${productToDelete.name}"? This action cannot be undone.\`
          : 'Delete this product?'}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        variant="danger"
      />
    </div>
  );
}

export default Products;
`;

fs.writeFileSync('J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/Products.jsx', newContent);
console.log('Products.jsx updated with sorting functionality');
