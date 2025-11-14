import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingCalculator from './components/FloatingCalculator';

// Eager load (used immediately)
import Login from './pages/auth/Login';
import Home from './pages/Home';

// Lazy load (loaded on demand)
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const EmployeeTable = lazy(() => import('./pages/EmployeeTable'));
const AddEmployee = lazy(() => import('./pages/employees/AddEmployee'));
const BranchManagement = lazy(() => import('./pages/admin/BranchManagement'));
const SalaryManagement = lazy(() => import('./pages/admin/SalaryManagement'));
const ManagerDashboard = lazy(() => import('./pages/attendance/ManagerDashboard'));
const QRDisplay = lazy(() => import('./pages/attendance/QRDisplay'));
const EmployeeCheckin = lazy(() => import('./pages/attendance/EmployeeCheckin'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-xl">Loading...</div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <FloatingCalculator />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Main Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          

          <Route
            path="/employee-table"
            element={
              <ProtectedRoute>
                <EmployeeTable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <EmployeeTable />
              </ProtectedRoute>
            }
          />

          {/* ✅ ADD EMPLOYEE ROUTE - FIXED */}
          <Route
            path="/employees/add"
            element={
              <ProtectedRoute>
                <AddEmployee />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/salary-management"
            element={
              <ProtectedRoute>
                <SalaryManagement />
              </ProtectedRoute>
            }
          />

          {/* ✅ BRANCH MANAGEMENT ROUTE - FIXED */}
          <Route
            path="/admin/branch-management"
            element={
              <ProtectedRoute>
                <BranchManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Attendance Routes */}
          <Route
            path="/attendance/display"
            element={
              <ProtectedRoute>
                <QRDisplay />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance/checkin"
            element={
              <ProtectedRoute>
                <EmployeeCheckin />
              </ProtectedRoute>
            }
          />

          {/* Coming Soon Routes */}
          <Route
            path="/leave/apply"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Apply for Leave</h1>
                    <p className="text-gray-600 mb-4">This feature is coming soon!</p>
                    <a href="/admin" className="text-blue-600 hover:underline">← Back to Admin Panel</a>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave/manage"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Leave Management</h1>
                    <p className="text-gray-600 mb-4">This feature is coming soon!</p>
                    <a href="/admin" className="text-blue-600 hover:underline">← Back to Admin Panel</a>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/salary-processing"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Process Salaries</h1>
                    <p className="text-gray-600 mb-4">This feature is coming soon!</p>
                    <a href="/admin" className="text-blue-600 hover:underline">← Back to Admin Panel</a>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          

          <Route
            path="/admin/config"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Organization Settings</h1>
                    <p className="text-gray-600 mb-4">This feature is coming soon!</p>
                    <a href="/admin" className="text-blue-600 hover:underline">← Back to Admin Panel</a>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;