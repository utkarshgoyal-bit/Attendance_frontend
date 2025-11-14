import React from 'react';
import { useAuth } from '../context/AuthContext';

const RoleGuard = ({ children, roles, fallback = null }) => {
  const { user, hasRole } = useAuth();

  // If no user, don't render
  if (!user) {
    return fallback;
  }

  // If roles array is provided, check if user has one of those roles
  if (roles && roles.length > 0) {
    const hasRequiredRole = hasRole(roles);
    
    // Debug logging (remove after fixing)
    console.log('RoleGuard Check:', {
      userRole: user.role,
      requiredRoles: roles,
      hasAccess: hasRequiredRole
    });
    
    if (!hasRequiredRole) {
      return fallback;
    }
  }

  // Render children
  return <>{children}</>;
};

export default RoleGuard;