import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Check authentication - only runs ONCE on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple simultaneous checks
      if (isCheckingAuth) {
        console.log('AuthContext: Already checking auth, skipping...');
        return;
      }

      setIsCheckingAuth(true);
      console.log('AuthContext: Checking authentication...');
      
      try {
        const token = localStorage.getItem('token');
        console.log('AuthContext: Token exists?', !!token);
        
        if (!token) { 
          console.log('AuthContext: No token found');
          setLoading(false); 
          setIsCheckingAuth(false);
          return; 
        }
        
        console.log('AuthContext: Fetching user data...');
        const res = await api.get('/auth/me');
        console.log('AuthContext: User data received:', res.data);
        setUser(res.data);
      } catch (error) {
        console.error('AuthContext: Error checking auth:', error.response?.status, error.response?.data);
        
        // Only clear token if it's actually invalid (not just network error)
        if (error.response?.status === 401) {
          console.error('AuthContext: Token is invalid, clearing...');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          console.warn('AuthContext: Network error, keeping token');
        }
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []); // Empty array - only run ONCE on mount

  const login = async (email, password, remember = false) => {
    try {
      console.log('AuthContext: Attempting login for:', email);
      const res = await api.post('/auth/login', { email, password, remember });
      console.log('AuthContext: Login successful');
      
      const { token, user: userData } = res.data;
      
      // Save token FIRST
      localStorage.setItem('token', token);
      console.log('AuthContext: Token saved to localStorage');
      
      // Then set user state
      setUser(userData);
      console.log('AuthContext: User state set:', userData);
      
      // Verify token was saved
      const savedToken = localStorage.getItem('token');
      console.log('AuthContext: Verification - token still in localStorage?', !!savedToken);
      
      return res.data;
    } catch (error) {
      console.error('AuthContext: Login failed:', error.response?.data || error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthContext: Logging out...');
    
    try { 
      await api.post('/auth/logout'); 
      console.log('AuthContext: Logout API call succeeded');
    } catch (error) {
      console.error('AuthContext: Logout API call failed:', error);
    }
    
    localStorage.removeItem('token');
    console.log('AuthContext: Token removed from localStorage');
    
    setUser(null);
    console.log('AuthContext: User state cleared');
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('AuthContext: Changing password...');
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      
      localStorage.setItem('token', res.data.token);
      console.log('AuthContext: New token saved');
      
      setUser(prev => ({ ...prev, isFirstLogin: false }));
      console.log('AuthContext: Password changed successfully');
      
      return res.data;
    } catch (error) {
      console.error('AuthContext: Password change failed:', error);
      throw error;
    }
  };

  const setSecurityQuestions = async (questions) => {
    try {
      console.log('AuthContext: Setting security questions...');
      await api.post('/auth/security-questions', { questions });
      
      setUser(prev => ({ ...prev, isFirstLogin: false, hasSecurityQuestions: true }));
      console.log('AuthContext: Security questions set successfully');
    } catch (error) {
      console.error('AuthContext: Setting security questions failed:', error);
      throw error;
    }
  };

  const value = { 
    user, 
    loading, 
    login, 
    logout, 
    changePassword, 
    setSecurityQuestions 
  };
  
  console.log('AuthContext: Rendering with state:', { 
    hasUser: !!user, 
    loading, 
    userRole: user?.role,
    userEmail: user?.email 
  });
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};