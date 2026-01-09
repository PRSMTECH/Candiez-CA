import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import axios from 'axios';
import styles from './Customers.module.css';

// Mock customer data for development
const mockCustomers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1990-05-15',
    loyaltyPoints: 250,
    totalPurchases: 1250.00,
    createdAt: '2024-01-15',
    status: 'active'
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1988-08-22',
    loyaltyPoints: 480,
    totalPurchases: 2350.00,
    createdAt: '2024-02-10',
    status: 'active'
  },
  {
    id: 3,
    firstName: 'Michael',
    lastName: 'Williams',
    email: 'mike.w@email.com',
    phone: '(555) 345-6789',
    dateOfBirth: '1995-03-10',
    loyaltyPoints: 120,
    totalPurchases: 650.00,
    createdAt: '2024-03-05',
    status: 'active'
  },
  {
    id: 4,
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@email.com',
    phone: '(555) 456-7890',
    dateOfBirth: '1992-11-28',
    loyaltyPoints: 890,
    totalPurchases: 4200.00,
    createdAt: '2023-11-20',
    status: 'vip'
  },
  {
    id: 5,
    firstName: 'David',
    lastName: 'Garcia',
    email: 'david.g@email.com',
    phone: '(555) 567-8901',
    dateOfBirth: '1985-07-04',
    loyaltyPoints: 50,
    totalPurchases: 320.00,
    createdAt: '2024-04-01',
    status: 'new'
  }
];

function Customers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Map snake_case API response to camelCase for frontend
  const mapCustomerFromApi = (customer) => ({
    id: customer.id,
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email || '',
    phone: customer.phone || '',
    dateOfBirth: customer.date_of_birth,
    loyaltyPoints: customer.loyalty_points || 0,
    totalPurchases: customer.total_spent || 0,
    createdAt: customer.created_at,
    status: customer.status || 'active'
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rawCustomers = response.data.customers || response.data || [];
      // Map API response to frontend format
      const mappedCustomers = rawCustomers.map(mapCustomerFromApi);
      setCustomers(mappedCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      // Only use mock data if API fails
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customerId) => {
    navigate(`/customers/${customerId}/edit`);
  };

  const handleView = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/customers/${customerToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from local state
      setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
    } catch {
      // Mock delete for development
      setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
    }
    setCustomerToDelete(null);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: styles.statusActive,
      vip: styles.statusVip,
      new: styles.statusNew,
      inactive: styles.statusInactive
    };
    return statusStyles[status] || styles.statusActive;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading customers...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>
            Manage your dispensary customers • {customers.length} total
          </p>
        </div>
        <Link to="/customers/new" className={styles.addButton}>
          + Add Customer
        </Link>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="vip">VIP</option>
          <option value="new">New</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className={styles.empty}>
          <p>No customers found matching your search.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Loyalty</th>
                <th>Total Purchases</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className={styles.customerInfo}>
                      <span className={styles.customerName}>
                        {customer.firstName} {customer.lastName}
                      </span>
                      <span className={styles.customerId}>
                        ID: {customer.id}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactInfo}>
                      <span>{customer.email}</span>
                      <span className={styles.phone}>{customer.phone}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadge(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <span className={styles.loyaltyPoints}>
                      {customer.loyaltyPoints} pts
                    </span>
                  </td>
                  <td className={styles.purchases}>
                    {formatCurrency(customer.totalPurchases)}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleView(customer.id)}
                        className={styles.viewButton}
                        title="View customer details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(customer.id)}
                        className={styles.editButton}
                        title="Edit customer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(customer)}
                        className={styles.deleteButton}
                        title="Delete customer"
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={customerToDelete
          ? `Are you sure you want to delete ${customerToDelete.firstName} ${customerToDelete.lastName}? This action cannot be undone.`
          : 'Are you sure you want to delete this customer?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default Customers;
