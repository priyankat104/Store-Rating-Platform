import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login              from './pages/Login';
import Signup             from './pages/Signup';
import AdminDashboard     from './pages/AdminDashboard';
import UserDashboard      from './pages/UserDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';

// Redirect authenticated users away from public pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    const redirectMap = { admin: '/admin', user: '/dashboard', store_owner: '/store-owner' };
    return <Navigate to={redirectMap[user?.role] || '/dashboard'} replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login"  element={<PublicRoute><Login  /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

    {/* Admin */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    {/* Normal User */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserDashboard />
        </ProtectedRoute>
      }
    />

    {/* Store Owner */}
    <Route
      path="/store-owner"
      element={
        <ProtectedRoute allowedRoles={['store_owner']}>
          <StoreOwnerDashboard />
        </ProtectedRoute>
      }
    />

    {/* Catch-all → login */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(100,116,139,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#818cf8', secondary: '#1e293b' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#1e293b' } },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
