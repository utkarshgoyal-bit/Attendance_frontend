import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { setToken, getToken, removeToken, setUser, getUser, removeUser } from '../utils/auth';

export const AuthContext = createContext();

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

  useEffect(() => {
    const token = getToken();
    const savedUser = getUser();
    
    console.log('🔍 Checking existing auth:', {
      hasToken: !!token,
      hasUser: !!savedUser
    });
    
    if (token && savedUser) {
      setUserState(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      console.log('📥 Login response received:', response.data);

      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        console.error('❌ Backend did not return token or user');
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
      
      console.log('💾 Saving token and user to localStorage...');
      
      // Save token and user
      setToken(token);
      setUser(userData);
      setUserState(userData);

      // Verify they were saved
      const savedToken = getToken();
      const savedUser = getUser();
      
      console.log('✅ Verification:', {
        tokenSaved: !!savedToken,
        userSaved: !!savedUser,
        userData: savedUser
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    removeToken();
    removeUser();
    setUserState(null);
    window.location.href = '/login';
  };

  const isAuthenticated = () => {
    const token = getToken();
    const currentUser = user || getUser();
    
    const authenticated = !!currentUser && !!token;
    
    console.log('🔐 isAuthenticated check:', {
      hasToken: !!token,
      hasUser: !!currentUser,
      result: authenticated
    });
    
    return authenticated;
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) {
      return false;
    }
    
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return rolesArray.includes(user.role);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};