import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const ROLE_LEVELS = { EMPLOYEE: 1, MANAGER: 2, HR_ADMIN: 3, SUPER_ADMIN: 4 };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.login({ email, password });
    const userData = data.user;
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (...roles) => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  const hasMinRole = (minRole) => {
    if (!user?.role) return false;
    return (ROLE_LEVELS[user.role] || 0) >= (ROLE_LEVELS[minRole] || 0);
  };

  const isAuthenticated = () => !!user || !!localStorage.getItem('token');

  // Role shortcuts
  const isEmployee = () => hasMinRole('EMPLOYEE');
  const isManager = () => hasMinRole('MANAGER');
  const isHRAdmin = () => hasMinRole('HR_ADMIN');
  const isSuperAdmin = () => hasRole('SUPER_ADMIN');

  // For testing - change role
  const changeRole = (newRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, setUser,
      hasRole, hasMinRole, isAuthenticated,
      isEmployee, isManager, isHRAdmin, isSuperAdmin,
      changeRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export { AuthContext };
