import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const HRDashboard = () => {
  const [stats, setStats] = useState({ employees: 0, branches: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, branchRes] = await Promise.all([
        apiClient.get('/employees'),
        apiClient.get('/branches')
      ]);

      setStats({
        employees: empRes.data.length,
        branches: branchRes.data.branches?.length || 0
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">HR Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-3xl font-bold">{stats.employees}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Branches</p>
          <p className="text-3xl font-bold">{stats.branches}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-3xl font-bold text-green-600">{stats.employees}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-3xl font-bold">November</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <a href="/employees/add" className="bg-blue-600 text-white p-4 rounded-lg text-center font-semibold">
          ➕ Add Employee
        </a>
        <a href="/admin/salary-processing" className="bg-green-600 text-white p-4 rounded-lg text-center font-semibold">
          💰 Process Salaries
        </a>
        <a href="/admin/config" className="bg-purple-600 text-white p-4 rounded-lg text-center font-semibold">
          ⚙️ Settings
        </a>
      </div>
    </div>
  );
};

export default HRDashboard;
