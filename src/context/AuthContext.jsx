import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize checkAuth to prevent recreation on every render
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) { 
        setLoading(false); 
        return; 
      }
      
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      console.error('CheckAuth: Error', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - only create once

  // Only run checkAuth once on mount
  useEffect(() => { 
    checkAuth(); 
  }, []); // Remove checkAuth from dependencies to prevent loop

  const login = async (email, password, remember = false) => {
    try {
      const res = await api.post('/auth/login', { email, password, remember });
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      
      return res.data;
    } catch (error) {
      console.error('Login: Failed', error.response?.data || error);
      throw error;
    }
  };

  const logout = async () => {
    try { 
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error('Logout: API call failed', error);
    }
    
    localStorage.removeItem('token');
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      localStorage.setItem('token', res.data.token);
      setUser(prev => ({ ...prev, isFirstLogin: false }));
      return res.data;
    } catch (error) {
      console.error('ChangePassword: Failed', error);
      throw error;
    }
  };

  const setSecurityQuestions = async (questions) => {
    try {
      await api.post('/auth/security-questions', { questions });
      setUser(prev => ({ ...prev, isFirstLogin: false, hasSecurityQuestions: true }));
    } catch (error) {
      console.error('SetSecurityQuestions: Failed', error);
      throw error;
    }
  };

  const value = { 
    user, 
    loading, 
    login, 
    logout, 
    changePassword, 
    setSecurityQuestions, 
    checkAuth 
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};