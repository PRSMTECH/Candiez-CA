import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './ProductEdit.module.css';

// Mock product data for development
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
    status: 'active',
    description: 'A popular sativa-dominant hybrid with sweet berry aroma.',
    supplier: 'Green Gardens Co.'
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
    status: 'active',
    description: 'Classic indica with earthy pine and sour lemon scent.',
    supplier: 'Premium Cannabis Inc.'
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
    status: 'active',
    description: 'Energizing sativa with pungent diesel-like aroma.',
    supplier: 'SoCal Growers'
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
    status: 'active',
    description: 'High-CBD tincture for relaxation without psychoactive effects.',
    supplier: 'Wellness Extracts'
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
    status: 'active',
    description: 'Potent indica vape cartridge with relaxing effects.',
    supplier: 'Vape Labs CA'
  }
];

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Flower',
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

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(response.data.product || response.data);
      } catch {
        // Use mock data for development
        const product = mockProducts.find(p => p.id === parseInt(id));
        if (product) {
          setFormData(product);
        } else {
          setError('Product not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/products/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/products');
    } catch {
      // Mock success for development
      console.log('Product updated (mock):', formData);
      navigate('/products');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading product data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/products')} className={styles.backButton}>
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Product</h1>
        <p className={styles.subtitle}>
          Product ID: {id} • {formData.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="Flower">Flower</option>
                <option value="Pre-Rolls">Pre-Rolls</option>
                <option value="Vape">Vape</option>
                <option value="Edibles">Edibles</option>
                <option value="Tinctures">Tinctures</option>
                <option value="Topicals">Topicals</option>
                <option value="Concentrates">Concentrates</option>
                <option value="Accessories">Accessories</option>
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
              <label htmlFor="price" className={styles.label}>Price ($)</label>
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
              <label htmlFor="stock" className={styles.label}>Stock Quantity</label>
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
              placeholder="Product description..."
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
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className={styles.userNote}>
        Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
      </div>
    </div>
  );
}

export default ProductEdit;
