import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingCalculator from './components/FloatingCalculator';

// ✅ Eager load (used immediately)
import Login from './pages/auth/Login';

// ✅ Lazy load (loaded on demand)
const Home = lazy(() => import('./pages/Home'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const EmployeeTable = lazy(() => import('./pages/EmployeeTable'));
const AddEmployee = lazy(() => import('./pages/employees/AddEmployee'));
const BranchManagement = lazy(() => import('./pages/admin/BranchManagement'));
const SalaryManagement = lazy(() => import('./pages/admin/SalaryManagement'));
const ManagerDashboard = lazy(() => import('./pages/attendance/ManagerDashboard'));
const QRDisplay = lazy(() => import('./pages/attendance/QRDisplay'));
const EmployeeCheckin = lazy(() => import('./pages/attendance/EmployeeCheckin'));
const SalaryComponents = lazy(() => import('./pages/admin/SalaryComponents'));
const EmployeeSalaryStructure = lazy(() => import('./pages/admin/EmployeeSalaryStructure')); // 👈 ADD THIS // 👈 NEW LINE
// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <FloatingCalculator />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes - All wrapped with lazy loading */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/employee-table" element={<ProtectedRoute><EmployeeTable /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><EmployeeTable /></ProtectedRoute>} />
            <Route path="/employees/add" element={<ProtectedRoute><AddEmployee /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/admin/salary-management" element={<ProtectedRoute><SalaryManagement /></ProtectedRoute>} />
            <Route path="/admin/salary-components" element={<ProtectedRoute><SalaryComponents /></ProtectedRoute>} />  
            <Route path="/admin/branch-management" element={<ProtectedRoute><BranchManagement /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/attendance/display" element={<ProtectedRoute><QRDisplay /></ProtectedRoute>} />
            <Route path="/attendance/checkin" element={<ProtectedRoute><EmployeeCheckin /></ProtectedRoute>} />

            {/* Coming Soon Routes */}
            <Route path="/leave/apply" element={<ProtectedRoute><ComingSoon title="Apply for Leave" /></ProtectedRoute>} />
            <Route path="/leave/manage" element={<ProtectedRoute><ComingSoon title="Leave Management" /></ProtectedRoute>} />
            <Route path="/admin/salary-processing" element={<ProtectedRoute><ComingSoon title="Process Salaries" /></ProtectedRoute>} />
            <Route path="/admin/config" element={<ProtectedRoute><ComingSoon title="Organization Settings" /></ProtectedRoute>} />
            <Route path="/admin/employee-salary/:employeeId" element={<ProtectedRoute><EmployeeSalaryStructure /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

// Coming Soon Component (inline)
const ComingSoon = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">This feature is coming soon!</p>
      <a href="/admin" className="text-blue-600 hover:underline font-medium">
        ← Back to Admin Panel
      </a>
    </div>
  </div>
);

export default App;