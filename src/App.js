import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './pages/auth/Login'; // Login page (in auth subfolder)

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
        {/* Public Route - Login (no protection) */}
        <Route path="/login" element={<Login />} />

        {/* Root route - Redirect to home */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/home" replace />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes */}
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
        
        <Route
          path="/employees/add"
          element={
            <ProtectedRoute>
              <AddEmployee />
            </ProtectedRoute>
          }
        />
        
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
        
        {/* 404 - Redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;