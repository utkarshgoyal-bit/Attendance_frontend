import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Card, CardHeader, CardContent, Button, Input, Modal, Table, Th, Td, Badge, Select, useToast } from '../components/ui';
import { Plus, Search, Edit, Lock, Power } from 'lucide-react';

const ROLES = [
  { value: 'ORG_ADMIN', label: 'Org Admin' },
  { value: 'HR_ADMIN', label: 'HR Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'EMPLOYEE', label: 'Employee' },
];

const Users = () => {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'EMPLOYEE' });
  const [newPassword, setNewPassword] = useState('');
  const { success, error: showError } = useToast();

  const fetchUsers = useCallback(async () => {
    // Don't fetch if still loading auth or no user
    if (authLoading || !user) {
      console.log('Users: Skipping fetch - auth loading or no user');
      return;
    }

    // Check token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Users: No token found!');
      return;
    }

    try {
      console.log('Users: Fetching with token...');
      setLoading(true);
      const res = await api.get('/users', { params: { search } });
      console.log('Users: Data received:', res.data);
      setUsers(res.data.users);
    } catch (err) {
      console.error('Users: Fetch error:', err);
      if (err.response?.status !== 401) {
        showError(err.response?.data?.message || 'Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  }, [search, authLoading, user, showError]);

  // Only fetch when user is ready
  useEffect(() => {
    if (!authLoading && user) {
      console.log('Users: User is ready, fetching data...');
      fetchUsers();
    }
  }, [authLoading, user, fetchUsers]);

  const getAvailableRoles = () => {
    if (!user) return [];
    const hierarchy = { PLATFORM_ADMIN: 4, ORG_ADMIN: 3, HR_ADMIN: 2, MANAGER: 1, EMPLOYEE: 0 };
    const userLevel = hierarchy[user?.role] || 0;
    return ROLES.filter(r => hierarchy[r.value] < userLevel);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, { email: formData.email, role: formData.role });
        success('User updated');
      } else {
        await api.post('/users', formData);
        success('User created');
      }
      setShowModal(false);
      setSelectedUser(null);
      setFormData({ email: '', password: '', role: 'EMPLOYEE' });
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/users/${selectedUser._id}/reset-password`, { newPassword });
      success('Password reset successfully');
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleToggleStatus = async (u) => {
    try {
      await api.patch(`/users/${u._id}/toggle-status`);
      success(`User ${u.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) {
      showError('Failed to update status');
    }
  };

  const openEdit = (u) => {
    setSelectedUser(u);
    setFormData({ email: u.email, role: u.role });
    setShowModal(true);
  };

  const openResetPassword = (u) => {
    setSelectedUser(u);
    setShowPasswordModal(true);
  };

  const roleColors = { PLATFORM_ADMIN: 'danger', ORG_ADMIN: 'warning', HR_ADMIN: 'info', MANAGER: 'success', EMPLOYEE: 'default' };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading authentication...</div>
        </div>
      </div>
    );
  }

  // Check if user has permission
  if (!user) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Not Logged In</h2>
            <p>Please log in to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!['PLATFORM_ADMIN', 'ORG_ADMIN', 'HR_ADMIN'].includes(user.role)) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p>You don't have permission to view this page.</p>
            <p className="text-sm text-gray-600 mt-2">Required role: HR Admin or above</p>
            <p className="text-sm text-gray-600">Your role: {user.role}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users</h2>
        {getAvailableRoles().length > 0 && (
          <Button onClick={() => { 
            setSelectedUser(null); 
            const availableRoles = getAvailableRoles();
            setFormData({ email: '', password: '', role: availableRoles[0]?.value || 'EMPLOYEE' }); 
            setShowModal(true); 
          }}>
            <Plus size={18} className="mr-2" /> Add User
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input className="pl-10" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {search ? `No users found matching "${search}"` : 'No users found'}
            </div>
          ) : (
            <Table>
              <thead className="bg-gray-50">
                <tr>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Organization</Th>
                  <Th>Status</Th>
                  <Th>Last Login</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <Td className="font-medium">{u.email}</Td>
                    <Td><Badge variant={roleColors[u.role]}>{u.role}</Badge></Td>
                    <Td>{u.orgId?.name || '-'}</Td>
                    <Td><Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></Td>
                    <Td>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(u)} title="Edit">
                          <Edit size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openResetPassword(u)} title="Reset Password">
                          <Lock size={16} />
                        </Button>
                        {u._id !== user?.id && (
                          <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(u)} title="Toggle Status">
                            <Power size={16} className={u.isActive ? 'text-red-500' : 'text-green-500'} />
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedUser ? 'Edit User' : 'Create User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email" 
            type="email" 
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })} 
            required 
          />
          {!selectedUser && (
            <Input 
              label="Password" 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
              placeholder="Min 6 characters" 
              required 
            />
          )}
          <Select 
            label="Role" 
            options={getAvailableRoles()} 
            value={formData.role} 
            onChange={e => setFormData({ ...formData, role: e.target.value })} 
            required 
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{selectedUser ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Reset Password">
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-gray-600">Reset password for: <strong>{selectedUser?.email}</strong></p>
          <Input 
            label="New Password" 
            type="password" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            placeholder="Min 6 characters" 
            required 
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button type="submit">Reset Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;