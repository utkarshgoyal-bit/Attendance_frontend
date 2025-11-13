import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import EmployeeTable from './pages/EmployeeTable';
import Login from './pages/login';
import AdminPanel from './pages/admin/AdminPanel';
import SalaryManagement from './pages/admin/SalaryManagement';
import SalaryProcessing from './pages/admin/SalaryProcessing';
import ConfigManagement from './pages/admin/ConfigManagement';
import BranchManagement from './pages/admin/BranchManagement';
import ManagerDashboard from './pages/attendance/ManagerDashboard';
import QRDisplay from './pages/attendance/QRDisplay';
import EmployeeCheckin from './pages/attendance/EmployeeCheckin';
import LeaveApplication from './pages/leave/LeaveApplication';
import LeaveManagement from './pages/leave/LeaveManagement';
import AddEmployee from './pages/employees/AddEmployee';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';
import ManagerDashboardNew from './pages/dashboards/ManagerDashboard';
import HRDashboard from './pages/dashboards/HRDashboard';
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />

          {/* Protected routes - with sidebar */}
          <Route path="/home" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
          <Route path="/dashboard/employee" element={<ProtectedRoute><Layout><EmployeeDashboard /></Layout></ProtectedRoute>} />
          <Route path="/dashboard/manager" element={<ProtectedRoute><Layout><ManagerDashboardNew /></Layout></ProtectedRoute>} />
          <Route path="/dashboard/hr" element={<ProtectedRoute><Layout><HRDashboard /></Layout></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><Layout><EmployeeTable /></Layout></ProtectedRoute>} />
          <Route path="/employees/add" element={<ProtectedRoute><Layout><AddEmployee /></Layout></ProtectedRoute>} />
          <Route path="/employee-table" element={<ProtectedRoute><Layout><EmployeeTable /></Layout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Layout><AdminPanel /></Layout></ProtectedRoute>} />
          <Route path="/admin/salary-management" element={<ProtectedRoute><Layout><SalaryManagement /></Layout></ProtectedRoute>} />
          <Route path="/admin/salary-processing" element={<ProtectedRoute><Layout><SalaryProcessing /></Layout></ProtectedRoute>} />
          <Route path="/admin/config" element={<ProtectedRoute><Layout><ConfigManagement /></Layout></ProtectedRoute>} />
          <Route path="/admin/branches" element={<ProtectedRoute><Layout><BranchManagement /></Layout></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute><Layout><ManagerDashboard /></Layout></ProtectedRoute>} />
          <Route path="/attendance/display" element={<ProtectedRoute><Layout fullWidth><QRDisplay /></Layout></ProtectedRoute>} />
          <Route path="/attendance/checkin" element={<ProtectedRoute><Layout><EmployeeCheckin /></Layout></ProtectedRoute>} />
          <Route path="/leave/apply" element={<ProtectedRoute><Layout><LeaveApplication /></Layout></ProtectedRoute>} />
          <Route path="/leave/manage" element={<ProtectedRoute><Layout><LeaveManagement /></Layout></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
