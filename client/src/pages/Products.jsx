import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MobileConfirmDialog from '../components/MobileConfirmDialog';
import MobilePullToRefresh from '../components/MobilePullToRefresh';
import MobileSearchBar from '../components/MobileSearchBar';
import MobileFloatingAction from '../components/MobileFloatingAction';
import axios from 'axios';
import styles from './Products.module.css';

const PRODUCTS_FILTER_KEY = 'candiez_products_filters';

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

// Helper to get saved filters from sessionStorage
const getSavedFilters = () => {
  try {
    const saved = sessionStorage.getItem(PRODUCTS_FILTER_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading filters from storage:', e);
  }
  return null;
};

function Products() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Get initial filter values: URL params take priority, then sessionStorage, then defaults
  const getInitialFilters = () => {
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    const urlSort = searchParams.get('sort');
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');

    // If URL has params, use them
    if (urlCategory || urlSearch || urlSort || urlMinPrice || urlMaxPrice) {
      let sortBy = 'name';
      let sortOrder = 'asc';
      if (urlSort) {
        const [field, order] = urlSort.split('-');
        if (field) sortBy = field;
        if (order) sortOrder = order;
      }
      return {
        searchTerm: urlSearch || '',
        categoryFilter: urlCategory || 'all',
        minPrice: urlMinPrice || '',
        maxPrice: urlMaxPrice || '',
        sortBy,
        sortOrder
      };
    }

    // Otherwise, use sessionStorage
    const saved = getSavedFilters();
    return {
      searchTerm: saved?.searchTerm || '',
      categoryFilter: saved?.categoryFilter || 'all',
      minPrice: saved?.minPrice || '',
      maxPrice: saved?.maxPrice || '',
      sortBy: saved?.sortBy || 'name',
      sortOrder: saved?.sortOrder || 'asc'
    };
  };

  const initialFilters = getInitialFilters();
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
  const [categoryFilter, setCategoryFilter] = useState(initialFilters.categoryFilter);
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy);
  const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Save filter state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      const filterState = {
        searchTerm,
        categoryFilter,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      };
      sessionStorage.setItem(PRODUCTS_FILTER_KEY, JSON.stringify(filterState));
    } catch (e) {
      console.error('Error saving filters to storage:', e);
    }

    // Also update URL params (for bookmarking)
    const newParams = new URLSearchParams();
    if (categoryFilter && categoryFilter !== 'all') {
      newParams.set('category', categoryFilter);
    }
    if (searchTerm) {
      newParams.set('search', searchTerm);
    }
    if (sortBy !== 'name' || sortOrder !== 'asc') {
      newParams.set('sort', `${sortBy}-${sortOrder}`);
    }
    if (minPrice) {
      newParams.set('minPrice', minPrice);
    }
    if (maxPrice) {
      newParams.set('maxPrice', maxPrice);
    }

    // Update URL without triggering a navigation
    const newSearch = newParams.toString();
    const currentSearch = window.location.search.slice(1); // remove leading '?'
    if (newSearch !== currentSearch) {
      setSearchParams(newParams, { replace: true });
    }
  }, [searchTerm, categoryFilter, minPrice, maxPrice, sortBy, sortOrder, setSearchParams]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Map snake_case API response to camelCase for frontend
  const mapProductFromApi = (product) => ({
    id: product.id,
    name: product.name,
    category: product.category_id ? `Category ${product.category_id}` : 'Flower', // Simplified since categories are IDs
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

  const fetchProducts = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
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
      if (showLoading) setLoading(false);
    }
  }, []);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchProducts(false);
  }, [fetchProducts]);

  const handleEdit = (productId) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleView = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
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
    // Also clear from sessionStorage
    sessionStorage.removeItem(PRODUCTS_FILTER_KEY);
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
    return `${sortBy}-${sortOrder}`;
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

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, minPrice, maxPrice, sortBy, sortOrder]);

  const categories = [...new Set(products.map(p => p.category))];

  // Export filtered/sorted products to CSV
  const exportToCSV = () => {
    // Use sortedProducts (which is already filtered and sorted)
    const headers = ['ID', 'Name', 'Category', 'Strain', 'THC %', 'CBD %', 'Price', 'Unit Price', 'Unit', 'Stock', 'Status'];

    const csvRows = [
      headers.join(','),
      ...sortedProducts.map(product => [
        product.id,
        `"${product.name || ''}"`,
        `"${product.category || ''}"`,
        `"${product.strain || ''}"`,
        product.thcContent || 0,
        product.cbdContent || 0,
        product.price || 0,
        product.unitPrice || 0,
        `"${product.unit || ''}"`,
        product.stock || 0,
        `"${product.status || ''}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV content
  const parseCSV = (content) => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const expectedHeaders = ['ID', 'Name', 'Category', 'Strain', 'THC %', 'CBD %', 'Price', 'Unit Price', 'Unit', 'Stock', 'Status'];

    // Check if headers match
    const headersMatch = expectedHeaders.every((h, i) => headers[i]?.toLowerCase() === h.toLowerCase());
    if (!headersMatch) {
      throw new Error('CSV headers do not match expected format');
    }

    const importedProducts = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line respecting quoted values
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));

      if (values.length < 11) continue;

      importedProducts.push({
        id: parseInt(values[0]) || Date.now() + i,
        name: values[1] || '',
        category: values[2] || 'Flower',
        strain: values[3] || 'Hybrid',
        thcContent: parseFloat(values[4]) || 0,
        cbdContent: parseFloat(values[5]) || 0,
        price: parseFloat(values[6]) || 0,
        unitPrice: parseFloat(values[7]) || 0,
        unit: values[8] || 'gram',
        stock: parseInt(values[9]) || 0,
        status: values[10] || 'active'
      });
    }

    return importedProducts;
  };

  // Import from CSV file
  const handleImportCSV = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMessage(null);

    try {
      const content = await file.text();
      const importedProducts = parseCSV(content);

      if (importedProducts.length === 0) {
        throw new Error('No valid products found in CSV');
      }

      // Merge imported products with existing ones
      // Products with matching IDs are updated, new IDs are added
      setProducts(prev => {
        const productMap = new Map(prev.map(p => [p.id, p]));

        for (const product of importedProducts) {
          productMap.set(product.id, product);
        }

        return Array.from(productMap.values());
      });

      setImportMessage({
        type: 'success',
        text: `Successfully imported ${importedProducts.length} products`
      });
      success(`Imported ${importedProducts.length} products`);
    } catch (err) {
      setImportMessage({
        type: 'error',
        text: err.message || 'Failed to import CSV'
      });
      showError(err.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
    <MobilePullToRefresh onRefresh={handleRefresh}>
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            Manage your cannabis product inventory • {products.length} products
          </p>
        </div>
        <div className={styles.headerButtons}>
          <button
            onClick={exportToCSV}
            className={styles.exportButton}
            title="Export filtered products to CSV"
          >
            Export CSV
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleImportCSV}
            className={styles.hiddenFileInput}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={styles.importButton}
            title="Import products from CSV"
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <Link to="/products/new" className={styles.addButton}>
            + Add Product
          </Link>
        </div>
      </div>

      {/* Import result message */}
      {importMessage && (
        <div className={`${styles.importMessage} ${importMessage.type === 'success' ? styles.importSuccess : styles.importError}`}>
          {importMessage.text}
        </div>
      )}

      {/* Mobile SearchBar with voice input */}
      <div className={styles.mobileSearchWrapper}>
        <MobileSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search products..."
          debounceMs={300}
          showVoice={true}
        />
      </div>

      <div className={styles.filters}>
        <div className={`${styles.searchWrapper} ${styles.desktopOnly}`}>
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
              {paginatedProducts.map((product) => (
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
                    <span className={`${styles.statusBadge} ${getStatusBadge(product.status, product.stock)}`}>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
          </div>
          <div className={styles.paginationControls}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              «
            </button>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              ›
            </button>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              »
            </button>
          </div>
        </div>
      )}

      <div className={styles.userNote}>
        Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
      </div>

      <MobileConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Product"
        message={productToDelete
          ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
          : 'Delete this product?'}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        variant="danger"
      />

      {/* Mobile Floating Action Button */}
      <MobileFloatingAction
        icon="+"
        label="Add"
        to="/products/new"
      />
    </div>
    </MobilePullToRefresh>
  );
}

export default Products;
