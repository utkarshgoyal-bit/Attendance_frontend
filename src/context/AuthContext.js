import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { setToken, getToken, removeToken, setUser, getUser, removeUser } from '../utils/auth';

export const AuthContext = createContext();

// Custom hook for easier access to auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = getToken();
    const savedUser = getUser();
    
    if (token && savedUser) {
      setUserState(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      
      // Save token and user
      setToken(token);
      setUser(user);
      setUserState(user);

      console.log('✅ Login successful:', user.email);
      return { success: true };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data?.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUserState(null);
    window.location.href = '/login';
  };

  const isAuthenticated = () => {
    return !!user && !!getToken();
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};