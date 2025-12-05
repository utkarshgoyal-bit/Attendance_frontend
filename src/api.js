import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor - add token to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request:', config.method.toUpperCase(), config.url, '- Token attached');
    } else {
      console.warn('API Request:', config.method.toUpperCase(), config.url, '- NO TOKEN!');
    }
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors but DON'T auto-logout on every 401
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.config.method.toUpperCase(), response.config.url, '- Status:', response.status);
    return response;
  },
  error => {
    console.error('API Response Error:', error.config?.method?.toUpperCase(), error.config?.url, '- Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      // Only redirect to login if we're NOT already on login page
      // And only if the error is from /auth/me endpoint (which means token is truly invalid)
      if (error.config?.url?.includes('/auth/me')) {
        console.error('Token validation failed - redirecting to login');
        localStorage.removeItem('token');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        console.warn('Got 401 but not from /auth/me - not redirecting');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;