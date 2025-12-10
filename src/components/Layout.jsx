import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Users, LayoutDashboard, LogOut, Menu, X, ChevronDown,
  Settings, Bell, User, Clock, CheckCircle, Umbrella, Award, Calendar
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = {
    PLATFORM_ADMIN: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/organizations', icon: Building2, label: 'Organizations' },
      { path: '/users', icon: Users, label: 'Users' },
    ],
    ORG_ADMIN: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/employees', icon: Users, label: 'Employees' },
      { path: '/attendance', icon: Clock, label: 'Attendance' },
      { path: '/attendance/approvals', icon: CheckCircle, label: 'Attendance Approvals' },
      { path: '/attendance/calendar', icon: Calendar, label: 'Calendar View' },
      { path: '/leaves', icon: Umbrella, label: 'Leaves' },
      { path: '/leaves/approvals', icon: CheckCircle, label: 'Leave Approvals' },
      { path: '/leaves/calendar', icon: Calendar, label: 'Leave Calendar' },
      { path: '/settings', icon: Settings, label: 'Settings' },
      { path: '/users', icon: Users, label: 'Users' },
    ],
    HR_ADMIN: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/employees', icon: Users, label: 'Employees' },
      { path: '/attendance', icon: Clock, label: 'Attendance' },
      { path: '/attendance/approvals', icon: CheckCircle, label: 'Attendance Approvals' },
      { path: '/leaves', icon: Umbrella, label: 'Leaves' },
      { path: '/leaves/approvals', icon: CheckCircle, label: 'Leave Approvals' },
      { path: '/leaves/calendar', icon: Calendar, label: 'Leave Calendar' },
      { path: '/settings', icon: Settings, label: 'Settings' },
      { path: '/users', icon: Users, label: 'Users' },
      { path: '/attendance/calendar', icon: Calendar, label: 'Calendar View' }
    ],
    MANAGER: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/employees', icon: Users, label: 'My Team' },
      { path: '/attendance', icon: Clock, label: 'Attendance' },
      { path: '/attendance/approvals', icon: CheckCircle, label: 'Attendance Approvals' },
      { path: '/leaves', icon: Umbrella, label: 'My Leaves' },
      { path: '/leaves/balance', icon: Award, label: 'Leave Balance' },
      { path: '/leaves/approvals', icon: CheckCircle, label: 'Leave Approvals' },
      { path: '/leaves/calendar', icon: Calendar, label: 'Team Calendar' },
      { path: '/attendance/calendar', icon: Calendar, label: 'Calendar View' }
    ],
    EMPLOYEE: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/attendance', icon: Clock, label: 'Attendance' },
      { path: '/leaves', icon: Umbrella, label: 'My Leaves' },
      { path: '/leaves/balance', icon: Award, label: 'Leave Balance' },
   { path: '/attendance/calendar', icon: Calendar, label: 'Calendar View' }
    ],
  };

  const items = navItems[user?.role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen bg-white border-r transition-transform ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {sidebarOpen && <span className="text-xl font-bold text-blue-600">HRMS</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {items.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all`}>
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">
            {items.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h1>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} />
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
                {sidebarOpen && (
                  <>
                    <span className="text-sm">{user?.email}</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;