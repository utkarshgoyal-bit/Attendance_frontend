import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EmployeeSalaryStructure = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch employee details
      const empResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch salary components
      const compResponse = await axios.get('http://localhost:5000/api/v2/salary-components', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-org-id': 'ORG001'
        }
      });
      
      setEmployee(empResponse.data);
      setComponents(compResponse.data.components);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Employee Salary Structure
        </h1>
        <p className="text-gray-600 mb-6">
          {employee?.firstName} {employee?.lastName} ({employee?.eId})
        </p>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Salary Components</h2>
          <p className="text-gray-500">Component assignment coming next...</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalaryStructure;