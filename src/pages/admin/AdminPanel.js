import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ChevronLeft, Users, DollarSign, Clock, FileText, ClipboardCheck, Calendar, Settings, LogOut } from 'lucide-react';
import { fetchEmployees } from '../../services/employeeTableApi';
import { fetchSalaryConfig } from '../../services/salaryConfigApi';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [salaryConfig, setSalaryConfig] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('October');
  const [currentYear, setCurrentYear] = useState('2025');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesResponse, configData] = await Promise.all([
          fetchEmployees(),
          fetchSalaryConfig()
        ]);

        const employeesData = employeesResponse.employees || employeesResponse;
        setEmployees(employeesData);
        setSalaryConfig(configData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadData();
  }, []);

  const totalEmployees = employees.length;

  const currentMonthSalaries = employees.map(emp => {
    const salary = emp.salaries?.find(s => s.month === currentMonth && s.year === parseInt(currentYear));
    return {
      ...emp,
      salary: salary || null
    };
  });

  const totalSalaryPaid = currentMonthSalaries
    .filter(emp => emp.salary)
    .reduce((sum, emp) => sum + (emp.salary.netPayable || 0), 0);

  const pendingSalaries = currentMonthSalaries.filter(emp => !emp.salary).length;
  const monthlyReports = currentMonthSalaries.filter(emp => emp.salary).length;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="bg-white h-20 flex items-center justify-between px-6 m-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Link
              to="/home"
              className="bg-gray-300 text-black py-2 px-2 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 mr-4"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-4xl font-bold text-black">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-600">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                  user?.role === 'HR_ADMIN' ? 'bg-blue-100 text-blue-800' :
                  user?.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user?.role}
                </span>
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Salary Paid</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalSalaryPaid.toLocaleString()}</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Salaries</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingSalaries}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Salaries ({currentMonth} {currentYear})</p>
                  <p className="text-2xl font-bold text-gray-900">{monthlyReports}</p>
                </div>
                <FileText className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              
              {/* 1. Check-In - Available to ALL authenticated users */}
              <Link
                to="/attendance/checkin"
                className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <ClipboardCheck className="w-6 h-6 text-indigo-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Check-In</p>
                  <p className="text-sm text-gray-600">Mark your attendance</p>
                </div>
              </Link>

              {/* 2. Apply for Leave - Available to ALL authenticated users */}
              <Link
                to="/leave/apply"
                className="flex items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <Calendar className="w-6 h-6 text-teal-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Apply for Leave</p>
                  <p className="text-sm text-gray-600">Submit leave application</p>
                </div>
              </Link>

              {/* 3. Attendance Approval - Manager and above */}
              <RoleGuard roles={['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']}>
                <Link
                  to="/admin/attendance"
                  className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <ClipboardCheck className="w-6 h-6 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Attendance Approval</p>
                    <p className="text-sm text-gray-600">Approve/reject attendance</p>
                  </div>
                </Link>
              </RoleGuard>

              {/* 4. Leave Management - Manager and above */}
              <RoleGuard roles={['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']}>
                <Link
                  to="/leave/manage"
                  className="flex items-center p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                >
                  <Calendar className="w-6 h-6 text-cyan-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Leave Management</p>
                    <p className="text-sm text-gray-600">Approve/reject leaves</p>
                  </div>
                </Link>
              </RoleGuard>

              {/* 5. Manage Employee Salaries - HR Admin and Super Admin only */}
              <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
                <Link
                  to="/employee-table"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Users className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Employee Salaries</p>
                    <p className="text-sm text-gray-600">View and edit salary details</p>
                  </div>
                </Link>
              </RoleGuard>

              {/* 6. Salary Configuration - HR Admin and Super Admin only */}
              <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
                <Link
                  to="/admin/salary-management"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Salary Configuration</p>
                    <p className="text-sm text-gray-600">Configure PF, ESI, deductions</p>
                  </div>
                </Link>
              </RoleGuard>

              {/* 7. Process Salaries - HR Admin and Super Admin only */}
              <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
                <Link
                  to="/admin/salary-processing"
                  className="flex items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <DollarSign className="w-6 h-6 text-emerald-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Process Salaries</p>
                    <p className="text-sm text-gray-600">Calculate monthly salaries</p>
                  </div>
                </Link>
              </RoleGuard>

              {/* 8. Organization Settings - Super Admin ONLY */}
              <RoleGuard roles={['SUPER_ADMIN']}>
                <Link
                  to="/admin/config"
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Settings className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Organization Settings</p>
                    <p className="text-sm text-gray-600">Configure policies</p>
                  </div>
                </Link>
              </RoleGuard>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;