import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const empId = "673db4bb4ea85b50f50f20d4"; // Temp

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const month = "November";
      const year = "2025";

      const [attendanceRes, balanceRes] = await Promise.all([
        apiClient.get(`/attendance/monthly-summary?employeeId=${empId}&month=${month}&year=${year}`),
        apiClient.get(`/leaves/balance/${empId}`)
      ]);

      setStats(attendanceRes.data);
      setBalance(balanceRes.data.balance);
    } catch (error) {
      console.error(error);
    }
  };

  if (!stats) return <div className="p-6">Loading...</div>;

  const chartData = [
    { name: 'Present', value: stats.presentDays, fill: '#10B981' },
    { name: 'Late', value: stats.lateDays, fill: '#F59E0B' },
    { name: 'Half Day', value: stats.halfDays, fill: '#EF4444' },
    { name: 'Absent', value: stats.absentDays, fill: '#6B7280' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-3xl font-bold">{stats.presentDays}/{stats.totalDays}</p>
          <p className="text-sm text-green-600">Days Present</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Casual Leave</p>
          <p className="text-3xl font-bold">{balance?.casualLeave.remaining}/{balance?.casualLeave.total}</p>
          <p className="text-sm text-blue-600">Available</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Sick Leave</p>
          <p className="text-3xl font-bold">{balance?.sickLeave.remaining}/{balance?.sickLeave.total}</p>
          <p className="text-sm text-blue-600">Available</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Late Days</p>
          <p className="text-3xl font-bold text-orange-600">{stats.lateDays}</p>
          <p className="text-sm text-gray-600">This Month</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-4">Attendance Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <a href="/attendance/checkin" className="bg-blue-600 text-white p-4 rounded-lg text-center font-semibold hover:bg-blue-700">
          ✓ Mark Attendance
        </a>
        <a href="/leave/apply" className="bg-green-600 text-white p-4 rounded-lg text-center font-semibold hover:bg-green-700">
          🏖️ Apply Leave
        </a>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
