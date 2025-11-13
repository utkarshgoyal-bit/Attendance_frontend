import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', code: '', address: { street: '', city: '', state: '', pinCode: '' },
    contact: { phone: '', email: '' }, orgId: '673db4bb4ea85b50f50f20d4'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await apiClient.post('/branches', { orgId: '673db4bb4ea85b50f50f20d4' });
      setBranches(res.data.branches);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/branches', formData);
      alert('Branch created!');
      setShowModal(false);
      fetchBranches();
      setFormData({
        name: '', code: '', address: { street: '', city: '', state: '', pinCode: '' },
        contact: { phone: '', email: '' }, orgId: '673db4bb4ea85b50f50f20d4'
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🏢 Branch Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          + Add Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white p-12 rounded-lg text-center">
          <p className="text-6xl mb-4">🏢</p>
          <p className="text-xl font-semibold mb-2">No Branches Yet</p>
          <p className="text-gray-600 mb-4">Create your first branch to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            + Add Branch
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {branches.map(branch => (
            <div key={branch._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">📍 {branch.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">Code: <span className="font-mono font-semibold">{branch.code}</span></p>

                  {branch.address && (
                    <p className="text-sm text-gray-600 mb-1">
                      📍 {branch.address.city}, {branch.address.state}
                    </p>
                  )}

                  {branch.contact?.phone && (
                    <p className="text-sm text-gray-600 mb-1">📞 {branch.contact.phone}</p>
                  )}

                  {branch.contact?.email && (
                    <p className="text-sm text-gray-600">📧 {branch.contact.email}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded text-sm ${
                    branch.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {branch.isActive ? '🟢 Active' : '⚫ Inactive'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <a href={`/employees?branch=${branch._id}`} className="text-sm text-blue-600 hover:underline">
                  View Employees
                </a>
                <span className="text-gray-300">|</span>
                <a href={`/attendance/display?branch=${branch.code}`} className="text-sm text-blue-600 hover:underline">
                  Open QR Display
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">➕ Add New Branch</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Branch Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Jaipur Office"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Branch Code *</label>
                  <input
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="JAIPUR"
                    className="w-full border rounded px-3 py-2 uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used in reports & QR codes</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <input
                  value={formData.address.street}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                  placeholder="123, Main Street"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    value={formData.address.city}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                    placeholder="Jaipur"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    value={formData.address.state}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                    placeholder="Rajasthan"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">PIN Code</label>
                  <input
                    value={formData.address.pinCode}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, pinCode: e.target.value}})}
                    placeholder="302001"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    value={formData.contact.phone}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})}
                    placeholder="+91 98765 43210"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})}
                    placeholder="jaipur@company.com"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {loading ? 'Creating...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
