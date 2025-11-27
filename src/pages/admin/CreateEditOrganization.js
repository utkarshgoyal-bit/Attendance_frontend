import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Building2, ChevronLeft, Save, Upload, X } from 'lucide-react';
import Sidebar from './Sidebar';
import apiClient from '../../services/apiClient';
import Toast from '../../components/Toast';

const CreateEditOrganization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    adminId: '',
    logo: ''
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchEmployees();
    if (isEdit) {
      fetchOrganization();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/employees');
      setEmployees(res.data.employees);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/organizations/${id}`);
      const org = res.data.organization;
      setFormData({
        name: org.name,
        email: org.email,
        phone: org.phone,
        address: org.address || '',
        adminId: org.adminId._id,
        logo: org.logo || ''
      });
      if (org.logo) setLogoPreview(org.logo);
    } catch (error) {
      showToast('Failed to load organization', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.adminId) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await apiClient.put(`/organizations/${id}`, formData);
        showToast('Organization updated successfully');
      } else {
        await apiClient.post('/organizations', formData);
        showToast('Organization created successfully');
      }
      navigate('/admin/organizations');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save organization', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/organizations"
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEdit ? 'Edit Organization' : 'Create Organization'}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isEdit ? 'Update organization details' : 'Add a new organization to the system'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="max-w-2xl">
            {/* Logo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Logo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview('');
                        setFormData({ ...formData, logo: '' });
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter organization name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="organization@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 1234567890"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter organization address"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Admin */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Admin <span className="text-red-500">*</span>
              </label>
              <select
                name="adminId"
                value={formData.adminId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select admin user</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.eId}) - {emp.role}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                This user will become the admin of this organization
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : isEdit ? 'Update Organization' : 'Create Organization'}
              </button>
              <Link
                to="/admin/organizations"
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CreateEditOrganization;