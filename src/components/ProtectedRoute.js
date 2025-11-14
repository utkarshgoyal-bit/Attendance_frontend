import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  console.log('ProtectedRoute Check:', {
    user: user,
    loading: loading,
    isAuthenticated: isAuthenticated(),
    path: location.pathname
  });

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    console.log('Insufficient permissions');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Access Denied - Insufficient Permissions</div>
      </div>
    );
  }

  console.log('Access granted');
  return children;
};

export default ProtectedRoute;