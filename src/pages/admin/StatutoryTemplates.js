import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Power } from 'lucide-react';

const StatutoryTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/statutory-templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-org-id': 'ORG001'
        },
        params: {
          orgId: 'ORG001'
        }
      });
      
      setTemplates(response.data.templates);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:5000/api/statutory-templates/${id}/toggle`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      fetchTemplates(); // Refresh list
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle template status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Statutory Templates</h1>
        <p className="text-gray-600 mt-2">Manage PF, ESI, PT and other statutory configurations</p>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {templates.length} templates configured
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance Based</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {template.templateName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {template.code}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.category === 'EARNING' ? 'bg-green-100 text-green-800' : 
                      template.category === 'DEDUCTION' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {template.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {template.calculationMethod}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.isAttendanceBased ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isAttendanceBased ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(template._id)}
                        className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                        title="Toggle Status"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No templates configured yet</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Import Default Templates
          </button>
        </div>
      )}
    </div>
  );
};

export default StatutoryTemplates;