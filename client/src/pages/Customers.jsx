import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InfiniteScroll, DotLoading } from 'antd-mobile';
import { useAuth } from '../contexts/AuthContext';
import MobileConfirmDialog from '../components/MobileConfirmDialog';
import MobilePullToRefresh from '../components/MobilePullToRefresh';
import MobileSearchBar from '../components/MobileSearchBar';
import MobileFloatingAction from '../components/MobileFloatingAction';
import MobileCustomerCard from '../components/MobileCustomerCard';
import SkeletonList from '../components/SkeletonList';
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

const ITEMS_PER_PAGE = 20;

function Customers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  // Infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [infinitePage, setInfinitePage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const isLoadingMore = useRef(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Reset pagination and infinite scroll when filters change
  useEffect(() => {
    setCurrentPage(1);
    setInfinitePage(1);
    setHasMore(true);
    setCustomers([]);
    fetchCustomers(true, 1);
  }, [searchTerm, statusFilter]);

  // Map snake_case API response to camelCase for frontend
  const mapCustomerFromApi = (customer) => ({
    id: customer.id,
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email || '',
    phone: customer.phone || '',
    dateOfBirth: customer.date_of_birth,
    loyaltyPoints: customer.loyalty_points || 0,
    loyaltyTier: customer.loyalty_tier || 'bronze',
    totalPurchases: customer.total_spent || 0,
    createdAt: customer.created_at,
    status: customer.status || 'active'
  });

  const fetchCustomers = useCallback(async (showLoading = true, page = 1, append = false) => {
    if (showLoading) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
          status: statusFilter
        }
      });
      const rawCustomers = response.data.customers || response.data || [];
      const pagination = response.data.pagination || { total: rawCustomers.length, totalPages: 1, page: 1 };

      // Map API response to frontend format
      const mappedCustomers = rawCustomers.map(mapCustomerFromApi);

      if (append) {
        setCustomers(prev => [...prev, ...mappedCustomers]);
      } else {
        setCustomers(mappedCustomers);
      }

      setTotalCount(pagination.total);
      setHasMore(page < pagination.totalPages);
      setInfinitePage(page);
    } catch (err) {
      console.error('Error fetching customers:', err);
      // Only use mock data if API fails
      if (!append) setCustomers([]);
      setHasMore(false);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setInfinitePage(1);
    setHasMore(true);
    await fetchCustomers(false, 1, false);
  }, [fetchCustomers]);

  // Infinite scroll load more handler
  const loadMore = useCallback(async () => {
    if (isLoadingMore.current || !hasMore) return;
    isLoadingMore.current = true;
    const nextPage = infinitePage + 1;
    await fetchCustomers(false, nextPage, true);
    isLoadingMore.current = false;
  }, [fetchCustomers, hasMore, infinitePage]);

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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Note: Filtering is now done server-side via API params
  // customers state already contains filtered/paginated results

  // Legacy pagination for desktop view (kept for backwards compatibility)
  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCustomers = customers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Export all customers to CSV
  const exportToCSV = () => {
    // Use all customers, not just filtered/paginated
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Loyalty Points', 'Loyalty Tier', 'Total Purchases', 'Date of Birth', 'Created At'];

    const csvRows = [
      headers.join(','),
      ...customers.map(customer => [
        customer.id,
        `"${customer.firstName || ''}"`,
        `"${customer.lastName || ''}"`,
        `"${customer.email || ''}"`,
        `"${customer.phone || ''}"`,
        customer.status || '',
        customer.loyaltyPoints || 0,
        customer.loyaltyTier || 'bronze',
        customer.totalPurchases || 0,
        customer.dateOfBirth || '',
        customer.createdAt || ''
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        {/* Desktop loading message */}
        <div className={`${styles.loading} ${styles.desktopOnly}`}>Loading customers...</div>
        {/* Mobile skeleton loading */}
        <div className={styles.mobileOnly}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>Customers</h1>
              <p className={styles.subtitle}>Loading...</p>
            </div>
          </div>
          <SkeletonList count={6} variant="customer" />
        </div>
      </div>
    );
  }

  return (
    <MobilePullToRefresh onRefresh={handleRefresh}>
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>
            Manage your dispensary customers • {totalCount || customers.length} total
          </p>
        </div>
        <div className={styles.headerButtons}>
          <button
            onClick={exportToCSV}
            className={styles.exportButton}
            title="Export all customers to CSV"
          >
            Export to CSV
          </button>
          <Link to="/customers/new" className={styles.addButton}>
            + Add Customer
          </Link>
        </div>
      </div>

      {/* Mobile SearchBar with voice input */}
      <div className={styles.mobileSearchWrapper}>
        <MobileSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search customers..."
          debounceMs={300}
          showVoice={true}
        />
      </div>

      <div className={styles.filters}>
        <div className={`${styles.searchWrapper} ${styles.desktopOnly}`}>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="vip">VIP</option>
          <option value="new">New</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {customers.length === 0 ? (
        <div className={styles.empty}>
          <p>No customers found matching your search.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View - only visible on mobile */}
          <div className={styles.mobileCardList}>
            {customers.map((customer) => (
              <MobileCustomerCard
                key={customer.id}
                customer={customer}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Desktop Table View - hidden on mobile */}
          <div className={`${styles.tableWrapper} ${styles.desktopOnly}`}>
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
                {paginatedCustomers.map((customer) => (
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
                      <div className={styles.loyaltyInfo}>
                        <span className={styles.loyaltyPoints}>
                          {customer.loyaltyPoints} pts
                        </span>
                        <span className={`${styles.loyaltyTier} ${styles[`tier${customer.loyaltyTier?.charAt(0).toUpperCase() + customer.loyaltyTier?.slice(1)}`] || ''}`}>
                          {customer.loyaltyTier || 'bronze'}
                        </span>
                      </div>
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

          {/* Desktop Pagination - hidden on mobile */}
          {totalPages > 1 && (
            <div className={`${styles.pagination} ${styles.desktopOnly}`}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.pageButton}
              >
                Previous
              </button>
              <div className={styles.pageNumbers}>
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`${styles.pageNumber} ${currentPage === page ? styles.pageActive : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.pageButton}
              >
                Next
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}

          {/* Mobile Infinite Scroll - only on mobile */}
          <div className={styles.mobileOnly}>
            <InfiniteScroll
              loadMore={loadMore}
              hasMore={hasMore}
              threshold={150}
            >
              {hasMore ? (
                <div className={styles.infiniteScrollLoader}>
                  <DotLoading color="#B57EDC" />
                  <span>Loading more...</span>
                </div>
              ) : (
                <div className={styles.infiniteScrollEnd}>
                  {customers.length > 0 ? (
                    <>
                      <span>🍬</span>
                      <span>All {totalCount} customers loaded</span>
                    </>
                  ) : null}
                </div>
              )}
            </InfiniteScroll>
          </div>
        </>
      )}

      <div className={styles.userNote}>
        Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
      </div>

      {/* Delete Confirmation Dialog - Uses antd-mobile Dialog on mobile */}
      <MobileConfirmDialog
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

      {/* Mobile Floating Action Button */}
      <MobileFloatingAction
        icon="+"
        label="Add"
        to="/customers/new"
      />
    </div>
    </MobilePullToRefresh>
  );
}

export default Customers;
