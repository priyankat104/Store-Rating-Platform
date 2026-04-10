import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const redirectMap = {
      admin: '/admin',
      user: '/dashboard',
      store_owner: '/store-owner',
    };
    return <Navigate to={redirectMap[user?.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
