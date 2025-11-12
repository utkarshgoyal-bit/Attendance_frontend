import axios from 'axios';

/**
 * Centralized API client with request/response interceptors
 * Base URL: http://localhost:5000/api
 * Timeout: 10 seconds
 */

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * - Logs all outgoing requests
 * - Adds authentication headers (role, user ID, employee ID)
 */
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);

    // Add authentication headers from localStorage
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const employeeId = localStorage.getItem('employeeId');

    if (userRole) {
      config.headers['x-user-role'] = userRole;
    }

    if (userId) {
      config.headers['x-user-id'] = userId;
    }

    if (employeeId) {
      config.headers['x-employee-id'] = employeeId;
    }

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