import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api'; // FIXED: Changed from './api' to '../api'

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('CheckAuth: Token exists?', !!token); // Debug log
      
      if (!token) { 
        setLoading(false); 
        return; 
      }
      
      console.log('CheckAuth: Fetching user data...'); // Debug log
      const res = await api.get('/auth/me');
      console.log('CheckAuth: User data received', res.data); // Debug log
      setUser(res.data);
    } catch (error) {
      console.error('CheckAuth: Error', error); // Debug log
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    console.log('AuthProvider: Mounting, checking auth...'); // Debug log
    checkAuth(); 
  }, [checkAuth]);

  const login = async (email, password, remember = false) => {
    try {
      console.log('Login: Attempting login...'); // Debug log
      const res = await api.post('/auth/login', { email, password, remember });
      console.log('Login: Success, saving token...'); // Debug log
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      
      console.log('Login: User set', res.data.user); // Debug log
      return res.data;
    } catch (error) {
      console.error('Login: Failed', error.response?.data || error); // Debug log
      throw error;
    }
  };

  const logout = async () => {
    try { 
      console.log('Logout: Calling API...'); // Debug log
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error('Logout: API call failed', error); // Debug log
    }
    
    console.log('Logout: Clearing local storage...'); // Debug log
    localStorage.removeItem('token');
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('ChangePassword: Attempting...'); // Debug log
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      localStorage.setItem('token', res.data.token);
      setUser(prev => ({ ...prev, isFirstLogin: false }));
      console.log('ChangePassword: Success'); // Debug log
      return res.data;
    } catch (error) {
      console.error('ChangePassword: Failed', error); // Debug log
      throw error;
    }
  };

  const setSecurityQuestions = async (questions) => {
    try {
      console.log('SetSecurityQuestions: Setting questions...'); // Debug log
      await api.post('/auth/security-questions', { questions });
      setUser(prev => ({ ...prev, isFirstLogin: false, hasSecurityQuestions: true }));
      console.log('SetSecurityQuestions: Success'); // Debug log
    } catch (error) {
      console.error('SetSecurityQuestions: Failed', error); // Debug log
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
  
  console.log('AuthProvider: Current state', { user, loading }); // Debug log
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};