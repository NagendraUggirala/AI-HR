import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';

const ProtectedRoute = ({ children, requiredRole = null, superAdminOnly = false }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = getUserRole();
    const loginPath = superAdminOnly ? '/super-admin/login' : '/login';

    // Check if user is authenticated
    if (!userRole) {
      alert('Access denied. Please login.');
      navigate(loginPath);
      return;
    }

    // Check for Super Admin only routes
    if (superAdminOnly && userRole !== 'superadmin') {
      alert('Access denied. Super Admin only.');
      navigate('/super-admin/login');
      return;
    }

    // Check for specific role requirements
    if (requiredRole && userRole !== requiredRole && userRole !== 'superadmin') {
      alert(`Access denied. ${requiredRole} role required.`);
      navigate('/login');
      return;
    }
  }, [navigate, requiredRole, superAdminOnly]);

  const userRole = getUserRole();

  // Show loading while checking authentication
  if (!userRole) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Check authorization again before rendering
  if (superAdminOnly && userRole !== 'superadmin') {
    return null;
  }

  if (requiredRole && userRole !== requiredRole && userRole !== 'superadmin') {
    return null;
  }

  return children;
};

export default ProtectedRoute;


