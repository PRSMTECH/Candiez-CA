import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Modal from '../components/Modal';
import { confirmDelete } from '../utils/mobileConfirm';
import axios from 'axios';
import styles from './Categories.module.css';

function Categories() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Open modal for adding
  const openAddModal = () => {
    setModalMode('add');
    setSelectedCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      sort_order: categories.length
    });
    setError(null);
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sort_order: category.sort_order || 0
    });
    setError(null);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setError(null);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'sort_order' ? parseInt(value) || 0 : value
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }
    if (!formData.slug.trim()) {
      setError('Category slug is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (modalMode === 'add') {
        await axios.post('/api/categories', formData);
      } else {
        await axios.put(`/api/categories/${selectedCategory.id}`, formData);
      }
      await fetchCategories();
      closeModal();
      success(modalMode === 'add' ? 'Category created!' : 'Category updated!');
    } catch (err) {
      console.error('Save category error:', err);
      setError(err.response?.data?.error || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const handleDelete = async (category) => {
    const confirmed = await confirmDelete(category.name);
    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`/api/categories/${category.id}`);
      await fetchCategories();
      success('Category deleted!');
    } catch (err) {
      console.error('Delete category error:', err);
      showError(err.response?.data?.error || 'Failed to delete category');
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(cat =>
    searchTerm === '' ||
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.slug && cat.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading categories...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Categories</h1>
          <p>Manage product categories • {categories.length} categories</p>
        </div>
        <button className={styles.addButton} onClick={openAddModal}>
          + Add Category
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📂</div>
          <p>No categories found.</p>
          <button className={styles.addButton} onClick={openAddModal}>
            Create your first category
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCategories.map((category) => (
            <div key={category.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{category.name}</h3>
                <span className={styles.cardSlug}>{category.slug}</span>
              </div>
              {category.description && (
                <p className={styles.cardDescription}>{category.description}</p>
              )}
              <div className={styles.cardMeta}>
                <span className={styles.sortOrder}>Order: {category.sort_order || 0}</span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => openEditModal(category)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(category)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.userNote}>
        Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={modalMode === 'add' ? 'Add New Category' : `Edit: ${selectedCategory?.name}`}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name">Category Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Flower, Edibles, Concentrates"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slug">Slug *</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g., flower, edibles"
              required
            />
            <span className={styles.hint}>URL-friendly identifier (auto-generated from name)</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description for this category..."
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sort_order">Sort Order</label>
            <input
              type="number"
              id="sort_order"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              min="0"
            />
            <span className={styles.hint}>Lower numbers appear first</span>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Saving...' : modalMode === 'add' ? 'Create Category' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Categories;
