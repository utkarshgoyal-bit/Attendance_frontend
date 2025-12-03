import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Card, Table, Button, Badge, Toast } from '../../components/ui';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

// ==================== MANAGER DASHBOARD ====================
export const AttendanceDashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [toast, setToast] = useState(null);

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getTodayAttendance({ status: filter === 'ALL' ? '' : filter });
      setRecords(data.attendance || []);
    } catch (error) {
      setToast({ message: 'Failed to load attendance', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleApprove = async (id) => {
    try {
      await api.approveAttendance(id);
      setToast({ message: 'Attendance approved', type: 'success' });
      loadAttendance();
    } catch (error) {
      setToast({ message: 'Failed to approve', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    
    try {
      await api.rejectAttendance(id, { reason });
      setToast({ message: 'Attendance rejected', type: 'success' });
      loadAttendance();
    } catch (error) {
      setToast({ message: 'Failed to reject', type: 'error' });
    }
  };

  const handleBulkApprove = async () => {
    const pendingIds = records.filter(r => r.status === 'PENDING').map(r => r._id);
    if (pendingIds.length === 0) return;
    
    if (!window.confirm(`Approve ${pendingIds.length} records?`)) return;
    
    try {
      await api.bulkApproveAttendance({ ids: pendingIds });
      setToast({ message: 'Bulk approval complete', type: 'success' });
      loadAttendance();
    } catch (error) {
      setToast({ message: 'Bulk approval failed', type: 'error' });
    }
  };

  const columns = [
    { 
      key: 'employee', 
      label: 'Employee',
      render: (row) => `${row.employeeId?.firstName || ''} ${row.employeeId?.lastName || ''}`
    },
    { key: 'eId', label: 'ID', render: (row) => row.employeeId?.eId },
    { 
      key: 'checkInTime', 
      label: 'Check In',
      render: (row) => new Date(row.checkInTime).toLocaleTimeString()
    },
    { 
      key: 'autoStatus', 
      label: 'Type',
      render: (row) => (
        <Badge variant={row.autoStatus === 'FULL_DAY' ? 'success' : row.autoStatus === 'LATE' ? 'warning' : 'danger'}>
          {row.autoStatus?.replace('_', ' ')}
        </Badge>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'danger' : 'warning'}>
          {row.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => row.status === 'PENDING' && (
        <div className="flex gap-2">
          <Button variant="success" size="sm" onClick={() => handleApprove(row._id)}>
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleReject(row._id)}>
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const pendingCount = records.filter(r => r.status === 'PENDING').length;

  return (
    <Layout 
      title="Attendance Approval" 
      backTo="/home"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAttendance}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          {pendingCount > 0 && (
            <Button variant="success" onClick={handleBulkApprove}>
              Approve All ({pendingCount})
            </Button>
          )}
        </div>
      }
    >
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex gap-4">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} data={records} loading={loading} />
      </Card>
    </Layout>
  );
};

// ==================== EMPLOYEE CHECK-IN ====================
export const EmployeeCheckin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState(null);

  const handleCheckin = async () => {
    setLoading(true);
    try {
      // Get QR code first (simulated for now)
      const qrResponse = await api.getActiveQR({ orgId: 'default', branchId: 'default' });
      
      // Check in
      const { data } = await api.checkIn({
        employeeId: user?.id || user?.employeeId,
        qrCode: qrResponse.data.qrCode,
        branchId: 'default'
      });

      setStatus({ type: 'success', message: 'Check-in successful!', data: data.attendance });
      setToast({ message: 'Checked in successfully!', type: 'success' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Check-in failed' });
      setToast({ message: error.response?.data?.message || 'Check-in failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Check In" backTo="/home">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Daily Attendance</h2>
            <p className="text-gray-500">Click the button below to mark your attendance</p>
          </div>

          <Button onClick={handleCheckin} loading={loading} className="w-full" size="lg">
            {loading ? 'Checking in...' : 'Check In Now'}
          </Button>

          {status && (
            <div className={`mt-6 p-4 rounded-lg ${status.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={status.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {status.message}
              </p>
              {status.data && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Time: {new Date(status.data.checkInTime).toLocaleTimeString()}</p>
                  <p>Status: {status.data.autoStatus?.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="mt-6">
          <h3 className="font-semibold mb-2">Today's Date</h3>
          <p className="text-2xl font-bold text-blue-600">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-gray-500 mt-1">
            Current Time: {new Date().toLocaleTimeString()}
          </p>
        </Card>
      </div>
    </Layout>
  );
};
