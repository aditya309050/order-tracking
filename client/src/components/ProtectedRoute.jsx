import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their proper dashboard
    if (user.role === 'CLIENT') {
      return <Navigate to="/client" replace />;
    }
    if (user.role === 'WAREHOUSE_ADMIN') {
      return <Navigate to="/warehouse" replace />;
    }
    if (user.role === 'OFFICE_ADMIN') {
      return <Navigate to="/office" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
