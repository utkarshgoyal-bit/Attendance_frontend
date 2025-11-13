import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🔐 API Request:', config.method.toUpperCase(), config.url, token ? '✅ Token' : '❌ No token');
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors WITHOUT auto-redirect
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    
    // DON'T auto-redirect - just log and throw error
    if (error.response?.status === 401) {
      console.error('🔒 Unauthorized - Token may be invalid');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;