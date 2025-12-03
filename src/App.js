import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PageLoader } from './components/ui';

// Eager load - used immediately
import Login from './pages/auth/Login';

// Lazy load - on demand
const Home = lazy(() => import('./pages/Home'));
const Employees = lazy(() => import('./pages/employees/Employees'));
const AddEmployee = lazy(() => import('./pages/employees/AddEmployee'));

// Lazy load attendance components
const AttendanceDashboard = lazy(() => 
  import('./pages/attendance/Attendance').then(module => ({ default: module.AttendanceDashboard }))
);
const EmployeeCheckin = lazy(() => 
  import('./pages/attendance/Attendance').then(module => ({ default: module.EmployeeCheckin }))
);

// Coming Soon placeholder
const ComingSoon = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">This feature is coming soon!</p>
      <a href="/home" className="text-blue-600 hover:underline font-medium">← Back to Home</a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected - All Users */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/attendance/checkin" element={<ProtectedRoute><EmployeeCheckin /></ProtectedRoute>} />
            
            {/* Protected - Manager+ */}
            <Route path="/admin/attendance" element={<ProtectedRoute roles={['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']}><AttendanceDashboard /></ProtectedRoute>} />
            <Route path="/leaves/manage" element={<ProtectedRoute roles={['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']}><ComingSoon title="Leave Management" /></ProtectedRoute>} />

            {/* Protected - HR Admin+ */}
            <Route path="/employees" element={<ProtectedRoute roles={['HR_ADMIN', 'SUPER_ADMIN']}><Employees /></ProtectedRoute>} />
            <Route path="/employees/add" element={<ProtectedRoute roles={['HR_ADMIN', 'SUPER_ADMIN']}><AddEmployee /></ProtectedRoute>} />
            <Route path="/employees/edit/:id" element={<ProtectedRoute roles={['HR_ADMIN', 'SUPER_ADMIN']}><AddEmployee /></ProtectedRoute>} />
            <Route path="/admin/salaries" element={<ProtectedRoute roles={['HR_ADMIN', 'SUPER_ADMIN']}><ComingSoon title="Salary Processing" /></ProtectedRoute>} />
            <Route path="/admin/salary-approval" element={<ProtectedRoute roles={['HR_ADMIN', 'SUPER_ADMIN']}><ComingSoon title="Salary Approval" /></ProtectedRoute>} />
            <Route path="/admin/salary-slips" element={<ProtectedRoute roles={['HR_ADMIN', 'SUPER_ADMIN']}><ComingSoon title="Salary Slips" /></ProtectedRoute>} />

            {/* Protected - Super Admin */}
            <Route path="/admin/branches" element={<ProtectedRoute roles={['SUPER_ADMIN']}><ComingSoon title="Branch Management" /></ProtectedRoute>} />
            <Route path="/admin/config" element={<ProtectedRoute roles={['SUPER_ADMIN']}><ComingSoon title="Organization Settings" /></ProtectedRoute>} />
            <Route path="/attendance/display" element={<ProtectedRoute roles={['SUPER_ADMIN']}><ComingSoon title="QR Display" /></ProtectedRoute>} />

            {/* Leaves */}
            <Route path="/leaves/apply" element={<ProtectedRoute><ComingSoon title="Apply Leave" /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
