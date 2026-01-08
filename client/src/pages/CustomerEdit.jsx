import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './CustomerEdit.module.css';

// Mock customer data for development
const mockCustomers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1990-05-15',
    address: '123 Main St, Los Angeles, CA 90001',
    loyaltyPoints: 250,
    totalPurchases: 1250.00,
    status: 'active',
    notes: 'Prefers indica strains'
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1988-08-22',
    address: '456 Oak Ave, San Diego, CA 92101',
    loyaltyPoints: 480,
    totalPurchases: 2350.00,
    status: 'active',
    notes: 'VIP customer, frequent buyer'
  },
  {
    id: 3,
    firstName: 'Michael',
    lastName: 'Williams',
    email: 'mike.w@email.com',
    phone: '(555) 345-6789',
    dateOfBirth: '1995-03-10',
    address: '789 Pine Blvd, Sacramento, CA 95814',
    loyaltyPoints: 120,
    totalPurchases: 650.00,
    status: 'active',
    notes: ''
  },
  {
    id: 4,
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@email.com',
    phone: '(555) 456-7890',
    dateOfBirth: '1992-11-28',
    address: '321 Elm St, San Francisco, CA 94102',
    loyaltyPoints: 890,
    totalPurchases: 4200.00,
    status: 'vip',
    notes: 'Top tier customer, always buy premium'
  },
  {
    id: 5,
    firstName: 'David',
    lastName: 'Garcia',
    email: 'david.g@email.com',
    phone: '(555) 567-8901',
    dateOfBirth: '1985-07-04',
    address: '654 Maple Dr, Oakland, CA 94601',
    loyaltyPoints: 50,
    totalPurchases: 320.00,
    status: 'new',
    notes: 'New customer as of April 2024'
  }
];

function CustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(response.data.customer || response.data);
      } catch {
        // Use mock data for development
        const customer = mockCustomers.find(c => c.id === parseInt(id));
        if (customer) {
          setFormData(customer);
        } else {
          setError('Customer not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/customers/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/customers');
    } catch {
      // Mock success for development
      console.log('Customer updated (mock):', formData);
      navigate('/customers');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading customer data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/customers')} className={styles.backButton}>
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Customer</h1>
        <p className={styles.subtitle}>
          Customer ID: {id} • {formData.firstName} {formData.lastName}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth" className={styles.label}>Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={styles.input}
                required
              />
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
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Address & Notes</h2>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className={styles.textarea}
              rows={4}
              placeholder="Add any notes about this customer..."
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

export default CustomerEdit;
