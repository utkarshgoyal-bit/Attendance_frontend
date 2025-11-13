import axios from 'axios';

/**
 * Centralized API client with JWT authentication
 * Base URL: http://localhost:5000/api
 * Timeout: 10 seconds
 * Credentials: Included (for cookies)
 */

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 seconds
  withCredentials: true, // Enable cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * - Logs all outgoing requests
 * - Authentication now handled via cookies (JWT)
 */
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    // Cookies are automatically sent with withCredentials: true
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors centrally
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { method, url } = error.config || {};
    const message = error.response?.data?.message || error.message;
    console.error(`API Error: ${method?.toUpperCase()} ${url} - ${message}`);
    return Promise.reject(error);
  }
);

export default apiClient;