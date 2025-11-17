import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Save } from 'lucide-react';

const CreateTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    templateName: '',
    code: '',
    category: 'DEDUCTION',
    type: 'STATUTORY',
    calculationMethod: 'PERCENTAGE',
    isActive: true,
    description: '',
    
    // Percentage config
    percentageConfig: {
      employeePercentage: '',
      employerPercentage: '',
      calculateOn: 'BASIC_SALARY'
    },
    
    // Fixed amount
    fixedAmount: '',
    
    // Ceiling/Threshold
    hasCeiling: false,
    ceilingAmount: '',
    hasMinThreshold: false,
    minThreshold: '',
    
    // Attendance
    isAttendanceBased: true,
    
    // Applicability
    applicability: {
      mandatory: true,
      conditions: []
    },
    
    // Employer contribution
    hasEmployerContribution: false,
    
    orgId: 'ORG001'
  });

  useEffect(() => {
    if (isEdit) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/statutory-templates/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFormData(response.data.template);
    } catch (error) {
      console.error('Error fetching template:', error);
      alert('Failed to fetch template');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePercentageChange = (field, value) => {
    setFormData({
      ...formData,
      percentageConfig: {
        ...formData.percentageConfig,
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Clean up data based on calculation method
      const cleanData = { ...formData };
      
      if (cleanData.calculationMethod !== 'PERCENTAGE') {
        delete cleanData.percentageConfig;
      }
      
      if (cleanData.calculationMethod !== 'FIXED_AMOUNT') {
        delete cleanData.fixedAmount;
      }

      if (isEdit) {
        await axios.put(
          `http://localhost:5000/api/statutory-templates/${id}`,
          cleanData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert('Template updated successfully!');
      } else {
        await axios.post(
          'http://localhost:5000/api/statutory-templates',
          cleanData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert('Template created successfully!');
      }

      navigate('/admin/statutory-templates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/admin/statutory-templates" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Templates
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Template' : 'Create Statutory Template'}
          </h1>
          <p className="text-gray-600 mt-2">Configure PF, ESI, PT or custom statutory rules</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                name="templateName"
                value={formData.templateName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Provident Fund"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., PF"
              />
            </div>
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="EARNING">Earning</option>
                <option value="DEDUCTION">Deduction</option>
                <option value="EMPLOYER_CONTRIBUTION">Employer Contribution</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="STATUTORY">Statutory</option>
                <option value="NON_STATUTORY">Non-Statutory</option>
              </select>
            </div>
          </div>

          {/* Calculation Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calculation Method *
            </label>
            <select
              name="calculationMethod"
              value={formData.calculationMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="PERCENTAGE">Percentage Based</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
              <option value="SLAB_BASED">Slab Based</option>
              <option value="FORMULA">Formula Based</option>
            </select>
          </div>

          {/* Dynamic Fields Based on Calculation Method */}
          {formData.calculationMethod === 'PERCENTAGE' && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Percentage Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.percentageConfig.employeePercentage}
                    onChange={(e) => handlePercentageChange('employeePercentage', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calculate On
                  </label>
                  <select
                    value={formData.percentageConfig.calculateOn}
                    onChange={(e) => handlePercentageChange('calculateOn', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BASIC_SALARY">Basic Salary</option>
                    <option value="GROSS_SALARY">Gross Salary</option>
                    <option value="CTC">CTC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {formData.calculationMethod === 'FIXED_AMOUNT' && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Fixed Amount</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="fixedAmount"
                  value={formData.fixedAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 200"
                />
              </div>
            </div>
          )}

          {/* Ceiling */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Ceiling & Threshold</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasCeiling"
                  checked={formData.hasCeiling}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Has Maximum Ceiling</span>
              </label>
              
              {formData.hasCeiling && (
                <input
                  type="number"
                  name="ceilingAmount"
                  value={formData.ceilingAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 15000"
                />
              )}
            </div>
          </div>

          {/* Attendance */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Attendance Settings</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isAttendanceBased"
                checked={formData.isAttendanceBased}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Prorate based on attendance</span>
            </label>
          </div>

          {/* Employer Contribution */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Employer Contribution</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="hasEmployerContribution"
                checked={formData.hasEmployerContribution}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Has employer contribution</span>
            </label>
            
            {formData.hasEmployerContribution && (
              <div className="mt-3">
                <input
                  type="number"
                  step="0.01"
                  value={formData.percentageConfig.employerPercentage || ''}
                  onChange={(e) => handlePercentageChange('employerPercentage', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Employer percentage (e.g., 12)"
                />
              </div>
            )}
          </div>

          {/* Applicability */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Applicability</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.applicability.mandatory}
                onChange={(e) => setFormData({
                  ...formData,
                  applicability: { ...formData.applicability, mandatory: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Mandatory for all employees</span>
            </label>
          </div>

          {/* Active Status */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/statutory-templates')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : (isEdit ? 'Update Template' : 'Create Template')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplate;