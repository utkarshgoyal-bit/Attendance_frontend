import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Fallback headers for testing
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role) {
    config.headers['x-user-role'] = user.role;
    config.headers['x-user-id'] = user.id;
    config.headers['x-employee-id'] = user.employeeId || user.id;
  }
  
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  // Auth
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  
  // Employees
  getEmployees: (params) => apiClient.get('/employees', { params }),
  getEmployee: (id) => apiClient.get(`/employees/${id}`),
  createEmployee: (data) => apiClient.post('/employees', data),
  updateEmployee: (id, data) => apiClient.put(`/employees/${id}`, data),
  deleteEmployee: (id) => apiClient.delete(`/employees/${id}`),
  getEmployeeStats: () => apiClient.get('/employees/stats'),
  
  // Attendance
  getActiveQR: (params) => apiClient.get('/attendance/qr/active', { params }),
  checkIn: (data) => apiClient.post('/attendance/checkin', data),
  getTodayAttendance: (params) => apiClient.get('/attendance/today', { params }),
  approveAttendance: (id) => apiClient.put(`/attendance/approve/${id}`),
  rejectAttendance: (id, data) => apiClient.put(`/attendance/reject/${id}`, data),
  bulkApproveAttendance: (data) => apiClient.post('/attendance/bulk-approve', data),
  getMonthlyAttendance: (params) => apiClient.get('/attendance/monthly', { params }),
  
  // Leaves
  applyLeave: (data) => apiClient.post('/leaves/apply', data),
  getLeaves: (params) => apiClient.get('/leaves', { params }),
  getLeaveBalance: (employeeId) => apiClient.get(`/leaves/balance/${employeeId}`),
  approveLeave: (id) => apiClient.put(`/leaves/approve/${id}`),
  rejectLeave: (id, data) => apiClient.put(`/leaves/reject/${id}`, data),
  
  // Salaries
  calculateSalary: (data) => apiClient.post('/salaries/calculate', data),
  saveSalary: (data) => apiClient.post('/salaries/save', data),
  getSalaries: (params) => apiClient.get('/salaries', { params }),
  approveSalary: (id) => apiClient.put(`/salaries/approve/${id}`),
  bulkCalculateSalaries: (data) => apiClient.post('/salaries/bulk-calculate', data),
  getSalaryConfig: (params) => apiClient.get('/salaries/config', { params }),
  updateSalaryConfig: (data) => apiClient.put('/salaries/config', data),
  getSalaryComponents: (params) => apiClient.get('/salaries/components', { params }),
  
  // Config
  getConfig: (orgId) => apiClient.get(`/config/${orgId}`),
  updateConfig: (orgId, data) => apiClient.put(`/config/${orgId}`, data),
  
  // Branches
  getBranches: (params) => apiClient.get('/branches', { params }),
  createBranch: (data) => apiClient.post('/branches', data),
  updateBranch: (id, data) => apiClient.put(`/branches/${id}`, data),
  
  // Organizations
  getOrganizations: () => apiClient.get('/organizations'),
  getOrganization: (id) => apiClient.get(`/organizations/${id}`),
  createOrganization: (data) => apiClient.post('/organizations', data),
  updateOrganization: (id, data) => apiClient.put(`/organizations/${id}`, data)
};

export default apiClient;
