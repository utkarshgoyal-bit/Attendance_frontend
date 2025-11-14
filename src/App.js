import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import EmployeeTable from './pages/EmployeeTable';
import Login from './pages/login';
import AdminPanel from './pages/admin/AdminPanel';
import SalaryManagement from './pages/admin/SalaryManagement';
import ManagerDashboard from './pages/attendance/ManagerDashboard';
import QRDisplay from './pages/attendance/QRDisplay';
import EmployeeCheckin from './pages/attendance/EmployeeCheckin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
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
              path="/employees" 
              element={
                <ProtectedRoute>
                  <EmployeeTable />
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

            {/* Add these missing routes */}
            <Route 
              path="/leave/apply" 
              element={
                <ProtectedRoute>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Apply for Leave</h1>
                    <p className="text-gray-600 mt-4">Leave application form coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/leave/manage" 
              element={
                <ProtectedRoute>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Leave Management</h1>
                    <p className="text-gray-600 mt-4">Leave management page coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/salary-processing" 
              element={
                <ProtectedRoute>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Process Salaries</h1>
                    <p className="text-gray-600 mt-4">Salary processing page coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/config" 
              element={
                <ProtectedRoute>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Organization Settings</h1>
                    <p className="text-gray-600 mt-4">Organization settings page coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;