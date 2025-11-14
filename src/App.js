import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';

// Main Pages
import Home from './pages/Home';
import EmployeeTable from './pages/EmployeeTable';

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel';
import SalaryManagement from './pages/admin/SalaryManagement';
import BranchManagement from './pages/admin/BranchManagement';

// Employee Pages
import AddEmployee from './pages/employees/AddEmployee';

// Attendance Pages
import QRDisplay from './pages/attendance/QRDisplay';
import EmployeeCheckin from './pages/attendance/EmployeeCheckin';
import ManagerDashboard from './pages/attendance/ManagerDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
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