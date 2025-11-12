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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/employees" element={<EmployeeTable />} />
          <Route path="/employee-table" element={<EmployeeTable />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/salary-management" element={<SalaryManagement />} />
          <Route path="/admin/salary-processing" element={<SalaryProcessing />} />
          <Route path="/admin/config" element={<ConfigManagement />} />
          <Route path="/admin/attendance" element={<ManagerDashboard />} />
          <Route path="/attendance/display" element={<QRDisplay />} />
          <Route path="/attendance/checkin" element={<EmployeeCheckin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
