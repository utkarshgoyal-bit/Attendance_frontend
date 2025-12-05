import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Card, CardHeader, CardContent, Button, Input, Modal, Table, Th, Td, Badge, useToast } from '../components/ui';
import { Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react';

const Organizations = () => {
  const { user, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact: { email: '', phone: '' } });
  const [adminData, setAdminData] = useState({ email: '', password: '' });
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const fetchOrganizations = useCallback(async () => {
    // Don't fetch if still loading auth or no user
    if (authLoading || !user) {
      console.log('Organizations: Skipping fetch - auth loading or no user');
      return;
    }

    // Check token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Organizations: No token found!');
      showError('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    try {
      console.log('Organizations: Fetching with token...');
      setLoading(true);
      const res = await api.get('/organizations', { params: { search } });
      console.log('Organizations: Data received:', res.data);
      setOrganizations(res.data.organizations);
    } catch (err) {
      console.error('Organizations: Fetch error:', err);
      
      // Only show error if it's not a 401 (auth issue)
      if (err.response?.status !== 401) {
        showError(err.response?.data?.message || 'Failed to load organizations');
      }
    } finally {
      setLoading(false);
    }
  }, [search, authLoading, user, showError, navigate]);

  // Only fetch when user is ready
  useEffect(() => {
    if (!authLoading && user) {
      console.log('Organizations: User is ready, fetching data...');
      fetchOrganizations();
    }
  }, [authLoading, user, fetchOrganizations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedOrg) {
        await api.put(`/organizations/${selectedOrg._id}`, formData);
        success('Organization updated');
      } else {
        await api.post('/organizations', formData);
        success('Organization created');
      }
      setShowModal(false);
      setSelectedOrg(null);
      setFormData({ name: '', contact: { email: '', phone: '' } });
      fetchOrganizations();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/organizations/${selectedOrg._id}/admin`, adminData);
      success('Organization Admin created');
      setShowAdminModal(false);
      setAdminData({ email: '', password: '' });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleToggleStatus = async (org) => {
    try {
      await api.patch(`/organizations/${org._id}/toggle-status`);
      success(`Organization ${org.isActive ? 'deactivated' : 'activated'}`);
      fetchOrganizations();
    } catch (err) {
      showError('Failed to update status');
    }
  };

  const openEdit = (org) => {
    setSelectedOrg(org);
    setFormData({ name: org.name, contact: org.contact || { email: '', phone: '' } });
    setShowModal(true);
  };

  const openAddAdmin = (org) => {
    setSelectedOrg(org);
    setShowAdminModal(true);
  };

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

  if (user.role !== 'PLATFORM_ADMIN') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p>You don't have permission to view this page.</p>
            <p className="text-sm text-gray-600 mt-2">Required role: Platform Admin</p>
            <p className="text-sm text-gray-600">Your role: {user.role}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Organizations</h2>
        <Button onClick={() => { 
          setSelectedOrg(null); 
          setFormData({ name: '', contact: { email: '', phone: '' } }); 
          setShowModal(true); 
        }}>
          <Plus size={18} className="mr-2" /> Add Organization
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                className="pl-10"
                placeholder="Search organizations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : organizations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {search ? `No organizations found matching "${search}"` : 'No organizations found. Click "Add Organization" to create one.'}
            </div>
          ) : (
            <Table>
              <thead className="bg-gray-50">
                <tr>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Status</Th>
                  <Th>Setup</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {organizations.map(org => (
                  <tr key={org._id} className="hover:bg-gray-50">
                    <Td className="font-medium">{org.name}</Td>
                    <Td>{org.contact?.email || '-'}</Td>
                    <Td>
                      <Badge variant={org.isActive ? 'success' : 'danger'}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge variant={org.setupComplete ? 'success' : 'warning'}>
                        {org.setupComplete ? 'Complete' : 'Pending'}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(org)} title="Edit">
                          <Edit size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openAddAdmin(org)} title="Add Admin">
                          <UserPlus size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleToggleStatus(org)} 
                          title={org.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Trash2 size={16} className={org.isActive ? 'text-red-500' : 'text-green-500'} />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedOrg ? 'Edit Organization' : 'Create Organization'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Organization Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Contact Email"
            type="email"
            value={formData.contact?.email || ''}
            onChange={e => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
          />
          <Input
            label="Contact Phone"
            value={formData.contact?.phone || ''}
            onChange={e => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{selectedOrg ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Add Admin Modal */}
      <Modal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} title="Create Organization Admin">
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <p className="text-sm text-gray-600">Creating admin for: <strong>{selectedOrg?.name}</strong></p>
          <Input
            label="Email"
            type="email"
            value={adminData.email}
            onChange={e => setAdminData({ ...adminData, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={adminData.password}
            onChange={e => setAdminData({ ...adminData, password: e.target.value })}
            placeholder="Min 6 characters"
            required
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowAdminModal(false)}>Cancel</Button>
            <Button type="submit">Create Admin</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Organizations;