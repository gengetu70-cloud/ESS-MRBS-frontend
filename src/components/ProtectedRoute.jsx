import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if route requires admin access
  if (adminOnly) {
    // Get role from multiple possible locations
    const userRole = user?.role || user?.userRole || user?.user?.role || '';
    const roleLower = userRole.toLowerCase();
    
    const isAdmin = 
      roleLower === 'admin' || 
      roleLower === 'administrator' ||
      user?.isAdmin === true ||
      user?.user?.isAdmin === true;
    
    // If not admin, redirect to user dashboard (NOT admin!)
    if (!isAdmin) {
      console.log('🚫 Non-admin trying to access admin route. Redirecting to /dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;