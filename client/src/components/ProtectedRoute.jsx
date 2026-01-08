import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute - Wraps routes that require authentication
 *
 * Features:
 * - Redirects unauthenticated users to login
 * - Shows loading state while checking auth
 * - Preserves intended destination in location state
 * - Optional role-based access control
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && user) {
    const hasPermission = allowedRoles.includes(user.role);
    if (!hasPermission) {
      // User doesn't have required role - redirect to dashboard or unauthorized page
      return <Navigate to="/dashboard" state={{ unauthorized: true }} replace />;
    }
  }

  // User is authenticated (and has required role if specified)
  return children;
}

export default ProtectedRoute;
