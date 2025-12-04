import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent, Badge } from '../components/ui';
import { Building2, Users, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const PlatformAdminDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Organizations</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <Building2 className="text-blue-600" size={40} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Organizations</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <CheckCircle className="text-green-600" size={40} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold">1</p>
              </div>
              <Users className="text-purple-600" size={40} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Setups</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <Clock className="text-orange-600" size={40} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <a href="/organizations" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Organization
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OrgAdminDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Organization Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Present Today</p>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Pending Approvals</p>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const DefaultDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome, {user?.email}</h2>
      <Card>
        <CardContent className="p-6">
          <p>Your role: <Badge variant="info">{user?.role}</Badge></p>
          <p className="text-gray-600 mt-2">Dashboard content will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div>
      {user?.role === 'PLATFORM_ADMIN' && <PlatformAdminDashboard />}
      {user?.role === 'ORG_ADMIN' && <OrgAdminDashboard />}
      {!['PLATFORM_ADMIN', 'ORG_ADMIN'].includes(user?.role) && <DefaultDashboard />}
    </div>
  );
};

export default Dashboard;
