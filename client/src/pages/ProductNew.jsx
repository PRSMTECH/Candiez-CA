import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './ProductNew.module.css';

function ProductNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    strain: 'Hybrid',
    thcContent: 0,
    cbdContent: 0,
    price: 0,
    unitPrice: 0,
    unit: 'gram',
    stock: 0,
    status: 'active',
    description: '',
    supplier: ''
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Product name is required.');
      setSaving(false);
      return;
    }

    if (formData.price <= 0) {
      setError('Price must be greater than 0.');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Generate SKU from name and timestamp
      const timestamp = Date.now().toString(36).toUpperCase();
      const sku = `PROD-${formData.name.replace(/\s+/g, '-').toUpperCase().slice(0, 10)}-${timestamp}`;

      // Map camelCase form fields to snake_case for API
      const apiData = {
        sku: sku,
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        strain_type: formData.strain.toLowerCase(),
        thc_percent: formData.thcContent,
        cbd_percent: formData.cbdContent,
        price: formData.price,
        stock_quantity: formData.stock,
        weight_unit: formData.unit
      };

      const response = await axios.post('/api/products', apiData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Product created successfully:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    } catch (err) {
      console.error('Product creation error:', err);
      setError(err.response?.data?.error || 'Failed to create product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Product</h1>
        <p className={styles.subtitle}>
          Add a new product to your inventory
        </p>
      </div>

      {success && (
        <div className={styles.successMessage}>
          Product created successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Product Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                required
                placeholder="e.g., Blue Dream"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category_id" className={styles.label}>Category</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={styles.select}
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories ? 'Loading categories...' : 'Select a category'}
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="strain" className={styles.label}>Strain Type</label>
              <select
                id="strain"
                name="strain"
                value={formData.strain}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="Indica">Indica</option>
                <option value="Sativa">Sativa</option>
                <option value="Hybrid">Hybrid</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.label}>Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="active">Active</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Potency</h2>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="thcContent" className={styles.label}>THC Content (%)</label>
              <input
                type="number"
                id="thcContent"
                name="thcContent"
                value={formData.thcContent}
                onChange={handleChange}
                className={styles.input}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="cbdContent" className={styles.label}>CBD Content (%)</label>
              <input
                type="number"
                id="cbdContent"
                name="cbdContent"
                value={formData.cbdContent}
                onChange={handleChange}
                className={styles.input}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Pricing & Stock</h2>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.label}>
                Price ($) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={styles.input}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="unitPrice" className={styles.label}>Unit Price ($)</label>
              <input
                type="number"
                id="unitPrice"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                className={styles.input}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="unit" className={styles.label}>Unit</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="gram">Gram</option>
                <option value="eighth">Eighth (3.5g)</option>
                <option value="quarter">Quarter (7g)</option>
                <option value="piece">Piece</option>
                <option value="joint">Joint</option>
                <option value="cartridge">Cartridge</option>
                <option value="bottle">Bottle</option>
                <option value="jar">Jar</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="stock" className={styles.label}>Initial Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={styles.input}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Additional Details</h2>

          <div className={styles.formGroup}>
            <label htmlFor="supplier" className={styles.label}>Supplier</label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className={styles.input}
              placeholder="e.g., Green Gardens Co."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              rows={4}
              placeholder="Product description, effects, flavor profile..."
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={saving || success}
          >
            {saving ? 'Saving...' : 'Create Product'}
          </button>
        </div>
      </form>

      <div className={styles.userNote}>
        Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
      </div>
    </div>
  );
}

export default ProductNew;
