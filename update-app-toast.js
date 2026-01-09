const fs = require('fs');

const newContent = `import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Toast from './components/Toast';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerNew from './pages/CustomerNew';
import CustomerEdit from './pages/CustomerEdit';
import CustomerDetail from './pages/CustomerDetail';
import POS from './pages/POS';
import Products from './pages/Products';
import ProductNew from './pages/ProductNew';
import ProductEdit from './pages/ProductEdit';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import Users from './pages/admin/Users';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Toast />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes with Layout (Sidebar) */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* All authenticated users can access */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/new" element={<CustomerNew />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/customers/:id/edit" element={<CustomerEdit />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductNew />} />
              <Route path="/products/:id/edit" element={<ProductEdit />} />
              <Route path="/categories" element={<Categories />} />

              {/* Manager and Admin only */}
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <TransactionDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Admin only routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
`;

fs.writeFileSync('J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/App.jsx', newContent);
console.log('App.jsx updated with ToastProvider and Toast component');
