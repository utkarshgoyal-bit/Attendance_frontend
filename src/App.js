import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EmployeeTable from './pages/EmployeeTable';
import Login from './pages/login';
import AdminPanel from './pages/admin/AdminPanel';
import SalaryManagement from './pages/admin/SalaryManagement';
import SalaryProcessing from './pages/admin/SalaryProcessing';
import ConfigManagement from './pages/admin/ConfigManagement';
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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes - no sidebar */}
          <Route path="/" element={<Layout fullWidth><Login /></Layout>} />

          {/* Authenticated routes - with sidebar */}
          <Route path="/home" element={<Layout><Home /></Layout>} />
          <Route path="/dashboard/employee" element={<Layout><EmployeeDashboard /></Layout>} />
          <Route path="/dashboard/manager" element={<Layout><ManagerDashboardNew /></Layout>} />
          <Route path="/dashboard/hr" element={<Layout><HRDashboard /></Layout>} />
          <Route path="/employees" element={<Layout><EmployeeTable /></Layout>} />
          <Route path="/employees/add" element={<Layout><AddEmployee /></Layout>} />
          <Route path="/employee-table" element={<Layout><EmployeeTable /></Layout>} />
          <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
          <Route path="/admin/salary-management" element={<Layout><SalaryManagement /></Layout>} />
          <Route path="/admin/salary-processing" element={<Layout><SalaryProcessing /></Layout>} />
          <Route path="/admin/config" element={<Layout><ConfigManagement /></Layout>} />
          <Route path="/admin/attendance" element={<Layout><ManagerDashboard /></Layout>} />
          <Route path="/attendance/display" element={<Layout fullWidth><QRDisplay /></Layout>} />
          <Route path="/attendance/checkin" element={<Layout><EmployeeCheckin /></Layout>} />
          <Route path="/leave/apply" element={<Layout><LeaveApplication /></Layout>} />
          <Route path="/leave/manage" element={<Layout><LeaveManagement /></Layout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
