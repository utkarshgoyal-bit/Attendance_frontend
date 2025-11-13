import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ManagerDashboard = () => {
  const [pending, setPending] = useState({ attendance: 0, leaves: 0 });
  const [todayStats, setTodayStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceRes, leavesRes] = await Promise.all([
        apiClient.get('/attendance/today?status=PENDING'),
        apiClient.get('/leaves/pending')
      ]);

      setPending({
        attendance: attendanceRes.data.count,
        leaves: leavesRes.data.leaves.length
      });

      const todayRes = await apiClient.get('/attendance/today');
      const records = todayRes.data.attendance;

      setTodayStats({
        total: records.length,
        approved: records.filter(r => r.status === 'APPROVED').length,
        pending: records.filter(r => r.status === 'PENDING').length
      });
    } catch (error) {
      console.error(error);
    }
  };

  const chartData = todayStats ? [
    { name: 'Approved', value: todayStats.approved, fill: '#10B981' },
    { name: 'Pending', value: todayStats.pending, fill: '#F59E0B' }
  ] : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manager Dashboard</h1>

      {/* Pending Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending Attendance</p>
          <p className="text-3xl font-bold text-orange-600">{pending.attendance}</p>
          <a href="/admin/attendance" className="text-sm text-blue-600">Review Now →</a>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending Leaves</p>
          <p className="text-3xl font-bold text-orange-600">{pending.leaves}</p>
          <a href="/leave/manage" className="text-sm text-blue-600">Review Now →</a>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Today Present</p>
          <p className="text-3xl font-bold text-green-600">{todayStats?.approved || 0}</p>
          <p className="text-sm text-gray-600">Team Members</p>
        </div>
      </div>

      {/* Chart */}
      {todayStats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Today's Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
