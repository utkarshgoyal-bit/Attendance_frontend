import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Save } from 'lucide-react';

const EmployeeSalaryStructure = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [components, setComponents] = useState([]);
  const [structure, setStructure] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
  try {
    const token = localStorage.getItem('token');
    
    console.log('Fetching data for employee:', employeeId); // 👈 ADD
    
    // Fetch employee details
    const empResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Employee response:', empResponse.data); // 👈 ADD
    
    // Fetch salary components
    const compResponse = await axios.get('http://localhost:5000/api/v2/salary-components', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-org-id': 'ORG001'
      }
    });
    
    console.log('Components response:', compResponse.data); // 👈 ADD

      setEmployee(empResponse.data);
      setComponents(compResponse.data.components);

      // Initialize structure with existing values if any
      const initialStructure = {};
      compResponse.data.components.forEach(comp => {
        initialStructure[comp._id] = {
          enabled: false,
          value: 0
        };
      });
      setStructure(initialStructure);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleComponentToggle = (componentId) => {
    setStructure({
      ...structure,
      [componentId]: {
        ...structure[componentId],
        enabled: !structure[componentId].enabled
      }
    });
  };

  const handleValueChange = (componentId, value) => {
    setStructure({
      ...structure,
      [componentId]: {
        ...structure[componentId],
        value: parseFloat(value) || 0
      }
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      // Prepare payload
      const enabledComponents = Object.keys(structure)
        .filter(key => structure[key].enabled)
        .map(key => ({
          componentId: key,
          value: structure[key].value
        }));

      if (enabledComponents.length === 0) {
        alert('Please select at least one component');
        return;
      }

      const payload = {
        employeeId: employeeId,
        orgId: 'ORG001',
        components: enabledComponents,
        effectiveFrom: new Date()
      };

      console.log('Saving structure:', payload);

      // Save to backend
      const response = await axios.post(
        'http://localhost:5000/api/employee-salary-structure',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Save response:', response.data);
      alert('Salary structure saved successfully!');

    } catch (error) {
      console.error('Error saving structure:', error);
      alert('Failed to save salary structure: ' + (error.response?.data?.message || error.message));
    }
  };

  const calculateTotal = (category) => {
    return Object.keys(structure)
      .filter(key => {
        const comp = components.find(c => c._id === key);
        return comp && comp.category === category && structure[key].enabled;
      })
      .reduce((sum, key) => sum + structure[key].value, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const earningComponents = components.filter(c => c.category === 'EARNING');
  const deductionComponents = components.filter(c => c.category === 'DEDUCTION');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/employees" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Employees
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Employee Salary Structure
            </h1>
            <p className="text-gray-600 mt-2">
              {employee?.firstName} {employee?.lastName} ({employee?.eId})
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Save Structure
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Earnings</h2>
            <div className="space-y-3">
              {earningComponents.map(comp => (
                <div key={comp._id} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={structure[comp._id]?.enabled || false}
                    onChange={() => handleComponentToggle(comp._id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{comp.name}</p>
                    <p className="text-xs text-gray-500">{comp.code}</p>
                  </div>
                  {structure[comp._id]?.enabled && (
                    <input
                      type="number"
                      value={structure[comp._id]?.value || 0}
                      onChange={(e) => handleValueChange(comp._id, e.target.value)}
                      className="w-32 px-3 py-1 border rounded text-sm"
                      placeholder="Amount"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-lg font-semibold text-green-700">
                Total Earnings: ₹{calculateTotal('EARNING').toLocaleString()}
              </p>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Deductions</h2>
            <div className="space-y-3">
              {deductionComponents.map(comp => (
                <div key={comp._id} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={structure[comp._id]?.enabled || false}
                    onChange={() => handleComponentToggle(comp._id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{comp.name}</p>
                    <p className="text-xs text-gray-500">{comp.code}</p>
                  </div>
                  {structure[comp._id]?.enabled && (
                    <input
                      type="number"
                      value={structure[comp._id]?.value || 0}
                      onChange={(e) => handleValueChange(comp._id, e.target.value)}
                      className="w-32 px-3 py-1 border rounded text-sm"
                      placeholder="Amount"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-lg font-semibold text-red-700">
                Total Deductions: ₹{calculateTotal('DEDUCTION').toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span>Gross Earnings:</span>
              <span className="font-semibold text-green-700">₹{calculateTotal('EARNING').toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Total Deductions:</span>
              <span className="font-semibold text-red-700">₹{calculateTotal('DEDUCTION').toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-3 border-t">
              <span>Net Salary:</span>
              <span className="text-blue-700">
                ₹{(calculateTotal('EARNING') - calculateTotal('DEDUCTION')).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalaryStructure;