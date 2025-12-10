import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui';
import Layout from './components/Layout';
import Login from './pages/Login';
import FirstLogin from './pages/FirstLogin';
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import Users from './pages/Users';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeView from './pages/EmployeeView';
import Settings from './pages/Settings';
import Attendance from './pages/Attendance';
import AttendanceApprovals from './pages/AttendanceApprovals';
import Leaves from './pages/Leaves';
import LeaveApprovals from './pages/LeaveApprovals';
import LeaveBalance from './pages/LeaveBalance';
import LeaveCalendar from './pages/LeaveCalendar';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.isFirstLogin || !user.hasSecurityQuestions) return <Navigate to="/first-login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user && !user.isFirstLogin && user.hasSecurityQuestions) return <Navigate to="/dashboard" />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/first-login" element={<FirstLogin />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Organizations & Users */}
            <Route path="/organizations" element={<ProtectedRoute roles={['PLATFORM_ADMIN']}><Organizations /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={['PLATFORM_ADMIN', 'ORG_ADMIN', 'HR_ADMIN']}><Users /></ProtectedRoute>} />

            {/* Employees */}
            <Route path="/employees" element={<ProtectedRoute roles={['PLATFORM_ADMIN', 'ORG_ADMIN', 'HR_ADMIN', 'MANAGER']}><Employees /></ProtectedRoute>} />
            <Route path="/employees/new" element={<ProtectedRoute roles={['PLATFORM_ADMIN', 'ORG_ADMIN', 'HR_ADMIN']}><EmployeeForm /></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute><EmployeeView /></ProtectedRoute>} />
            <Route path="/employees/:id/edit" element={<ProtectedRoute roles={['PLATFORM_ADMIN', 'ORG_ADMIN', 'HR_ADMIN']}><EmployeeForm /></ProtectedRoute>} />

            {/* Settings */}
            <Route path="/settings" element={<ProtectedRoute roles={['PLATFORM_ADMIN', 'ORG_ADMIN', 'HR_ADMIN']}><Settings /></ProtectedRoute>} />

            {/* Attendance */}
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/attendance/approvals" element={<ProtectedRoute roles={['MANAGER', 'HR_ADMIN', 'ORG_ADMIN']}><AttendanceApprovals /></ProtectedRoute>} />

            {/* Leaves - NEW */}
            <Route path="/leaves" element={<ProtectedRoute><Leaves /></ProtectedRoute>} />
            <Route path="/leaves/balance" element={<ProtectedRoute><LeaveBalance /></ProtectedRoute>} />
            <Route path="/leaves/approvals" element={<ProtectedRoute roles={['MANAGER', 'HR_ADMIN', 'ORG_ADMIN']}><LeaveApprovals /></ProtectedRoute>} />
            <Route path="/leaves/calendar" element={<ProtectedRoute roles={['MANAGER', 'HR_ADMIN', 'ORG_ADMIN']}><LeaveCalendar /></ProtectedRoute>} />
            <Route path="/attendance/calendar" element={<ProtectedRoute><AttendanceCalendar /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;