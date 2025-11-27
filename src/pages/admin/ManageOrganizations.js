import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Edit2, Power, Trash2, Users } from 'lucide-react';
import Sidebar from './Sidebar';
import apiClient from '../../services/apiClient';
import Toast from '../../components/Toast';

const ManageOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    filterOrganizations();
  }, [organizations, searchTerm, filterActive]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/organizations');
      setOrganizations(res.data.organizations);
    } catch (error) {
      showToast('Failed to load organizations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterOrganizations = () => {
    let filtered = organizations;

    // Filter by active status
    if (filterActive === 'active') {
      filtered = filtered.filter(org => org.isActive);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(org => !org.isActive);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrgs(filtered);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleToggleStatus = async (orgId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this organization?`)) {
      return;
    }

    try {
      await apiClient.patch(`/organizations/${orgId}/toggle`, {
        isActive: !currentStatus
      });
      showToast(`Organization ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchOrganizations();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (orgId) => {
    if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/organizations/${orgId}`);
      showToast('Organization deleted successfully');
      fetchOrganizations();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete organization', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Organizations</h1>
                <p className="text-gray-500 text-sm">Create and manage organizations in the system</p>
              </div>
            </div>
            <Link
              to="/admin/organizations/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Create Organization
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Organizations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => (
            <div key={org._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition">
              <div className="p-6">
                {/* Logo & Name */}
                <div className="flex items-start gap-4 mb-4">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{org.name}</h3>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      org.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {org.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {org.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {org.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Admin:</span> {org.adminId?.firstName} {org.adminId?.lastName}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={() => navigate(`/admin/organizations/edit/${org._id}`)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(org._id, org.isActive)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Power className="w-4 h-4" />
                    {org.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(org._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrgs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterActive !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first organization'}
            </p>
            {!searchTerm && filterActive === 'all' && (
              <Link
                to="/admin/organizations/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Create Organization
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ManageOrganizations;