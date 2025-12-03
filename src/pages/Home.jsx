import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, Badge, RoleGuard } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Users, DollarSign, ClipboardCheck, Calendar, Settings, UserPlus, Building2 } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ employees: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.getEmployeeStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    // Everyone
    { to: '/attendance/checkin', label: 'Check In', icon: ClipboardCheck, color: 'blue', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { to: '/leaves/apply', label: 'Apply Leave', icon: Calendar, color: 'green', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    
    // Manager+
    { to: '/admin/attendance', label: 'Approve Attendance', icon: ClipboardCheck, color: 'purple', roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { to: '/leaves/manage', label: 'Manage Leaves', icon: Calendar, color: 'orange', roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    
    // HR Admin+
    { to: '/employees', label: 'Employees', icon: Users, color: 'indigo', roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    { to: '/employees/add', label: 'Add Employee', icon: UserPlus, color: 'teal', roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    { to: '/admin/salaries', label: 'Process Salaries', icon: DollarSign, color: 'emerald', roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    
    // Super Admin
    { to: '/admin/branches', label: 'Branches', icon: Building2, color: 'cyan', roles: ['SUPER_ADMIN'] },
    { to: '/admin/config', label: 'Settings', icon: Settings, color: 'gray', roles: ['SUPER_ADMIN'] },
  ];

  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    teal: 'bg-teal-500 hover:bg-teal-600',
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
    cyan: 'bg-cyan-500 hover:bg-cyan-600',
    gray: 'bg-gray-500 hover:bg-gray-600',
  };

  return (
    <Layout title={`Welcome, ${user?.name || 'User'}!`}>
      {/* Stats Cards - HR Admin+ only */}
      <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.total || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.active || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClipboardCheck className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Approvals</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.pending || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">₹{loading ? '...' : '0'}</p>
              </div>
            </div>
          </Card>
        </div>
      </RoleGuard>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <RoleGuard key={action.to} roles={action.roles}>
            <Link to={action.to}>
              <Card className={`${colorClasses[action.color]} text-white text-center py-8 hover:shadow-lg transition-all`}>
                <action.icon className="w-10 h-10 mx-auto mb-3" />
                <p className="font-medium">{action.label}</p>
              </Card>
            </Link>
          </RoleGuard>
        ))}
      </div>

      {/* Role Info */}
      <div className="mt-8">
        <Card>
          <h3 className="font-semibold mb-2">Your Role</h3>
          <Badge variant="info">{user?.role?.replace('_', ' ')}</Badge>
          <p className="text-sm text-gray-500 mt-2">
            {user?.role === 'SUPER_ADMIN' && 'Full system access - manage everything'}
            {user?.role === 'HR_ADMIN' && 'HR operations - employees, salaries, leaves'}
            {user?.role === 'MANAGER' && 'Team management - approve attendance and leaves'}
            {user?.role === 'EMPLOYEE' && 'Self-service - check-in, apply leave, view salary'}
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default Home;
