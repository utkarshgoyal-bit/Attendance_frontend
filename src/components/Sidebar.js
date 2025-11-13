import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardCheck,
  Calendar,
  CheckCircle,
  Users,
  DollarSign,
  Settings,
  Monitor,
  LogOut,
  UserCircle,
  UserPlus,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, hasRole, logout, changeRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const menuItems = [
    // Everyone - Self Service
    {
      section: 'Self Service',
      roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'],
      items: [
        { path: '/dashboard/employee', label: 'Dashboard', icon: LayoutDashboard, roles: ['EMPLOYEE'] },
        { path: '/dashboard/manager', label: 'Dashboard', icon: LayoutDashboard, roles: ['MANAGER'] },
        { path: '/dashboard/hr', label: 'Dashboard', icon: LayoutDashboard, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
        { path: '/home', label: 'Home', icon: Home, roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
        { path: '/attendance/checkin', label: 'Check In', icon: ClipboardCheck, roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
        { path: '/leave/apply', label: 'Apply Leave', icon: Calendar, roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
      ]
    },

    // Manager+ - Approvals
    {
      section: 'Approvals',
      roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'],
      items: [
        { path: '/admin/attendance', label: 'Approve Attendance', icon: CheckCircle, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
        { path: '/leave/manage', label: 'Manage Leaves', icon: Calendar, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
      ]
    },

    // HR Admin+ - HR Operations
    {
      section: 'HR Management',
      roles: ['HR_ADMIN', 'SUPER_ADMIN'],
      items: [
        { path: '/employees', label: 'Employees', icon: Users, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
        { path: '/employees/add', label: 'Add Employee', icon: UserPlus, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/salary-management', label: 'Salary Config', icon: DollarSign, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/salary-processing', label: 'Process Salaries', icon: DollarSign, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
      ]
    },

    // Super Admin - System
    {
      section: 'System',
      roles: ['SUPER_ADMIN'],
      items: [
        { path: '/admin/config', label: 'Org Settings', icon: Settings, roles: ['SUPER_ADMIN'] },
        { path: '/attendance/display', label: 'QR Display', icon: Monitor, roles: ['SUPER_ADMIN'], newTab: true },
      ]
    }
  ];

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'HR_ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MANAGER':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="w-64 bg-white h-screen shadow-xl fixed left-0 top-0 flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-3 mb-3">
          <img src="/logo2.png" alt="Logo" className="w-10 h-10 bg-white rounded-lg p-1" />
          <div>
            <h1 className="text-xl font-bold">HR System</h1>
            <p className="text-xs opacity-75">Maitrii Infotech</p>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-blue-500">
          <UserCircle className="w-8 h-8" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${getRoleBadgeColor()}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((section, sectionIdx) => (
          // Only show section if user has role for it
          hasRole(...section.roles) && (
            <div key={sectionIdx} className="mb-6">
              {/* Section Header */}
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                {section.section}
              </h3>

              {/* Section Items */}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  hasRole(...item.roles) && (
                    <li key={item.path}>
                      {item.newTab ? (
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive(item.path)
                              ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </a>
                      ) : (
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive(item.path)
                              ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      )}
                    </li>
                  )
                ))}
              </ul>
            </div>
          )
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Role Switcher (Testing) */}
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">
            Switch Role (Testing)
          </label>
          <select
            value={user?.role}
            onChange={(e) => {
              changeRole(e.target.value);
              window.location.reload();
            }}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="HR_ADMIN">HR Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
