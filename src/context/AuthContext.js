import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage or use default
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    // Default user for testing - change role to test different permissions
    return {
      id: '673db4bb4ea85b50f50f20d4',
      employeeId: '673db4bb4ea85b50f50f20d4',
      role: 'SUPER_ADMIN', // Options: EMPLOYEE, MANAGER, HR_ADMIN, SUPER_ADMIN
      name: 'Admin User',
      email: 'admin@maitrii.com'
    };
  });

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('employeeId', user.employeeId);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('employeeId');
    }
  }, [user]);

  /**
   * Check if user has any of the specified roles
   * @param {...string} roles - Roles to check
   * @returns {boolean}
   */
  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  /**
   * Check if user is at least a certain role level
   * Uses role hierarchy: SUPER_ADMIN > HR_ADMIN > MANAGER > EMPLOYEE
   * @param {string} minRole - Minimum required role
   * @returns {boolean}
   */
  const hasMinRole = (minRole) => {
    const hierarchy = {
      EMPLOYEE: 1,
      MANAGER: 2,
      HR_ADMIN: 3,
      SUPER_ADMIN: 4
    };

    const userLevel = hierarchy[user?.role] || 0;
    const requiredLevel = hierarchy[minRole] || 0;

    return userLevel >= requiredLevel;
  };

  /**
   * Check if user is a specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  const isRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user is an employee (lowest level)
   * @returns {boolean}
   */
  const isEmployee = () => isRole('EMPLOYEE');

  /**
   * Check if user is a manager or above
   * @returns {boolean}
   */
  const isManager = () => hasMinRole('MANAGER');

  /**
   * Check if user is HR admin or above
   * @returns {boolean}
   */
  const isHRAdmin = () => hasMinRole('HR_ADMIN');

  /**
   * Check if user is super admin
   * @returns {boolean}
   */
  const isSuperAdmin = () => isRole('SUPER_ADMIN');

  /**
   * Login user (placeholder - will be replaced with real auth)
   * @param {Object} userData - User data
   */
  const login = (userData) => {
    setUser(userData);
  };

  /**
   * Logout user
   */
  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  /**
   * Update user data
   * @param {Object} updates - User data to update
   */
  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  /**
   * Change user role (for testing purposes)
   * @param {string} newRole - New role to assign
   */
  const changeRole = (newRole) => {
    setUser(prev => ({ ...prev, role: newRole }));
  };

  const value = {
    user,
    setUser,
    hasRole,
    hasMinRole,
    isRole,
    isEmployee,
    isManager,
    isHRAdmin,
    isSuperAdmin,
    login,
    logout,
    updateUser,
    changeRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
