import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="page-loading">
      <div className="spinner spinner-red" />
      <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Loading...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

export const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="page-loading">
      <div className="spinner spinner-red" />
    </div>
  );
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};
