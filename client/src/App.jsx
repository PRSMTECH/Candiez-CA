import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd-mobile';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ShiftProvider } from './contexts/ShiftContext';
import { TutorialProvider } from './contexts/TutorialContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Toast from './components/Toast';
import WelcomeTutorial from './components/WelcomeTutorial';
import { antdMobileTheme } from './theme/antdMobileTheme';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
    <ThemeProvider>
      <ConfigProvider theme={antdMobileTheme}>
        <AuthProvider>
          <ShiftProvider>
            <TutorialProvider>
              <ToastProvider>
                <BrowserRouter>
                  <Toast />
                  <WelcomeTutorial />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

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
            </TutorialProvider>
          </ShiftProvider>
        </AuthProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;
