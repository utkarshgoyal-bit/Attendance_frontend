import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleGuard } from './ui';
import {
  Home, Users, UserPlus, ClipboardCheck, Calendar, CheckCircle,
  DollarSign, Settings, Monitor, LogOut, Building2, FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, changeRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const menuItems = [
    // Self Service - All users
    { path: '/home', label: 'Home', icon: Home, roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { path: '/attendance/checkin', label: 'Check In', icon: ClipboardCheck, roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { path: '/leaves/apply', label: 'Apply Leave', icon: Calendar, roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    
    // Manager+ - Approvals
    { path: '/admin/attendance', label: 'Approve Attendance', icon: CheckCircle, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { path: '/leaves/manage', label: 'Manage Leaves', icon: Calendar, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    
    // HR Admin+ - HR Operations
    { path: '/employees', label: 'Employees', icon: Users, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    { path: '/employees/add', label: 'Add Employee', icon: UserPlus, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    { path: '/admin/salaries', label: 'Salaries', icon: DollarSign, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    { path: '/admin/salary-approval', label: 'Approve Salaries', icon: CheckCircle, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    { path: '/admin/salary-slips', label: 'Salary Slips', icon: FileText, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    
    // Super Admin - System
    { path: '/admin/branches', label: 'Branches', icon: Building2, roles: ['SUPER_ADMIN'] },
    { path: '/admin/config', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN'] },
    { path: '/attendance/display', label: 'QR Display', icon: Monitor, roles: ['SUPER_ADMIN'], newTab: true },
  ];

  const getRoleBadgeColor = () => {
    const colors = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800',
      HR_ADMIN: 'bg-blue-100 text-blue-800',
      MANAGER: 'bg-green-100 text-green-800',
      EMPLOYEE: 'bg-gray-100 text-gray-800'
    };
    return colors[user?.role] || colors.EMPLOYEE;
  };

  return (
    <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0 flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <h1 className="text-xl font-bold text-white">🏢 HR System</h1>
        <div className="mt-3">
          <p className="text-sm text-blue-100">{user?.name || user?.email}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor()}`}>
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <RoleGuard key={item.path} roles={item.roles}>
            {item.newTab ? (
              <a
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </a>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            )}
          </RoleGuard>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Role Switcher (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Switch Role (Dev)</label>
            <select
              value={user?.role || ''}
              onChange={(e) => changeRole(e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-2"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR_ADMIN">HR Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
