import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ChevronLeft, Users, DollarSign, Clock, FileText, ClipboardCheck, Calendar, Settings, LogOut } from 'lucide-react';
import { fetchEmployees } from '../../services/employeeTableApi';
import { fetchSalaryConfig } from '../../services/salaryConfigApi';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';

const AdminPanel = () => {
  const { user, isHRAdmin, isSuperAdmin, isManager } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [salaryConfig, setSalaryConfig] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('October');
  const [currentYear, setCurrentYear] = useState('2025');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesResponse, configData] = await Promise.all([
          fetchEmployees(), // This now returns paginated object
          fetchSalaryConfig()
        ]);

        // Extract employees array from paginated response
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
        <div className="bg-white h-20 flex items-center justify-between px-6 m-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Link
              to="/home"
              className="bg-gray-300 text-black py-2 px-2 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 mr-4"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-4xl font-bold text-black">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                  user?.role === 'HR_ADMIN' ? 'bg-blue-100 text-blue-800' :
                  user?.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Select Month/Year:</label>
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['2023', '2024', '2025'].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Users className="w-8 h-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <DollarSign className="w-8 h-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Salary Paid ({currentMonth} {currentYear})</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalSalaryPaid.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Salaries ({currentMonth} {currentYear})</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingSalaries}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processed Salaries ({currentMonth} {currentYear})</p>
                  <p className="text-2xl font-bold text-gray-900">{monthlyReports}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Available to all authenticated users */}
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

              {/* Available to all authenticated users */}
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

              {/* Manager and above */}
              <RoleGuard roles={['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']}>
                <Link
                  to="/admin/attendance"
                  className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <ClipboardCheck className="w-6 h-6 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Attendance Approval</p>
                    <p className="text-sm text-gray-600">Approve/reject employee attendance</p>
                  </div>
                </Link>
              </RoleGuard>

              {/* Manager and above */}
              <RoleGuard roles={['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']}>
                <Link
                  to="/leave/manage"
                  className="flex items-center p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                >
                  <Calendar className="w-6 h-6 text-cyan-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Leave Management</p>
                    <p className="text-sm text-gray-600">Approve/reject leave applications</p>
                  </div>
                </Link>
              </RoleGuard>

              {/* HR Admin and Super Admin only */}
              <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
                <Link
                  to="/employee-table"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Users className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Employee Salaries</p>
                    <p className="text-sm text-gray-600">View and edit employee salary details</p>
                  </div>
                </Link>
              </RoleGuard>

              {/* HR Admin and Super Admin only */}
              <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
                <Link
                  to="/admin/salary-management"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Salary Configuration</p>
                    <p className="text-sm text-gray-600">Configure PF, ESI, and deductions</p>
                  </div>
                </Link>
              </RoleGuard>

              {/* HR Admin and Super Admin only */}
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

              {/* Super Admin only */}
              <RoleGuard roles={['SUPER_ADMIN']}>
                <Link
                  to="/admin/config"
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Settings className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Organization Settings</p>
                    <p className="text-sm text-gray-600">Configure attendance and leave policies</p>
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
