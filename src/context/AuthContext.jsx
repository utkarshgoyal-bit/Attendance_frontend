import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password, remember = false) => {
    const res = await api.post('/auth/login', { email, password, remember });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    localStorage.setItem('token', res.data.token);
    setUser(prev => ({ ...prev, isFirstLogin: false }));
    return res.data;
  };

  const setSecurityQuestions = async (questions) => {
    await api.post('/auth/security-questions', { questions });
    setUser(prev => ({ ...prev, isFirstLogin: false, hasSecurityQuestions: true }));
  };

  const value = { user, loading, login, logout, changePassword, setSecurityQuestions, checkAuth };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
