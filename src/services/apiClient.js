import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token attached to request:', config.url);
    } else {
      console.log('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors WITHOUT redirecting
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response success:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.config?.url);
    
    // Handle 401 - Token invalid/expired
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Token may be invalid');
      // DON'T redirect here - let ProtectedRoute handle it
      // Just log the error
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;