import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../admin/Sidebar';
import { ChevronLeft, CheckCircle, XCircle, Clock, User, Calendar, AlertCircle } from 'lucide-react';
import { getTodayAttendance, approveAttendance, rejectAttendance } from '../../services/attendanceApi';
import Toast from '../../components/Toast';

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const MANAGER_ID = user?.id;

  // Null check for user
  if (!user) {
    return <div>Loading user data...</div>;
  }

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectData, setRejectData] = useState({ id: null, reason: '' });
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date()); // FEATURE 1: Auto-refresh tracking
  const [bulkApproving, setBulkApproving] = useState(false); // FEATURE 3: Bulk approve loading state
  const [toast, setToast] = useState(null); // Toast notification state

  // ========== TOAST HELPERS ==========
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    loadAttendance();
  }, [filter, selectedBranch, refreshTrigger]);

  // ========== FEATURE 1: AUTO-REFRESH EVERY 30 SECONDS ==========
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing attendance data...');
      loadAttendance();
      setLastRefreshTime(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [filter, selectedBranch]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const branch = selectedBranch === 'All' ? '' : selectedBranch;
      const status = filter === 'ALL' ? '' : filter;

      const response = await getTodayAttendance(branch, status);
      setAttendanceRecords(response.attendance || []);
      setLastRefreshTime(new Date()); // Update refresh time on successful load
    } catch (error) {
      console.error('Error loading attendance:', error);
      showToast('Failed to load attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (attendanceId) => {
    if (!window.confirm('Are you sure you want to approve this attendance?')) {
      return;
    }

    try {
      setActionLoading(attendanceId);
      await approveAttendance(attendanceId, MANAGER_ID);
      showToast('Attendance approved successfully!', 'success');
      setRefreshTrigger(prev => prev + 1); // Refresh data
    } catch (error) {
      console.error('Error approving attendance:', error);
      showToast('Failed to approve attendance', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (attendanceId) => {
    setRejectData({ id: attendanceId, reason: '' });
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectData.reason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }

    try {
      setActionLoading(rejectData.id);
      await rejectAttendance(rejectData.id, MANAGER_ID, rejectData.reason);
      showToast('Attendance rejected successfully!', 'success');
      setShowRejectModal(false);
      setRejectData({ id: null, reason: '' });
      setRefreshTrigger(prev => prev + 1); // Refresh data
    } catch (error) {
      console.error('Error rejecting attendance:', error);
      showToast('Failed to reject attendance', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ========== FEATURE 3: BULK APPROVE ALL PENDING ==========
  const handleBulkApprove = async () => {
    const pendingList = attendanceRecords.filter(a => a.status === 'PENDING');

    if (pendingList.length === 0) {
      showToast('No pending approvals', 'error');
      return;
    }

    const confirmed = window.confirm(
      `Approve all ${pendingList.length} pending check-ins?`
    );

    if (!confirmed) return;

    setBulkApproving(true);

    try {
      // Approve all pending in parallel
      const promises = pendingList.map(attendance =>
        approveAttendance(attendance._id, MANAGER_ID)
      );

      await Promise.all(promises);

      showToast(`✓ Approved ${pendingList.length} attendance records!`, 'success');
      setRefreshTrigger(prev => prev + 1); // Refresh data
    } catch (error) {
      console.error('Bulk approve error:', error);
      showToast('Some approvals failed. Please try again.', 'error');
    } finally {
      setBulkApproving(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status}
      </span>
    );
  };

  const getAutoStatusBadge = (autoStatus) => {
    const colors = {
      FULL_DAY: 'bg-green-100 text-green-800',
      LATE: 'bg-yellow-100 text-yellow-800',
      HALF_DAY: 'bg-orange-100 text-orange-800',
      ABSENT: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[autoStatus] || 'bg-gray-100 text-gray-800'}`}>
        {autoStatus?.replace('_', ' ')}
      </span>
    );
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stats = {
    total: attendanceRecords.length,
    pending: attendanceRecords.filter(r => r.status === 'PENDING').length,
    approved: attendanceRecords.filter(r => r.status === 'APPROVED').length,
    rejected: attendanceRecords.filter(r => r.status === 'REJECTED').length
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="bg-white h-20 flex items-center justify-start px-6 m-4 rounded-lg shadow-lg">
          <Link
            to="/admin"
            className="bg-gray-300 text-black py-2 px-2 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 mr-4"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-bold text-black">
            Attendance Management
          </h1>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards - FEATURE 5: Added hover animations */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Today</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="ALL">All</option>
              </select>

              <label className="text-sm font-medium text-gray-700 ml-4">Branch:</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="All">All Branches</option>
                <option value="JAIPUR">Jaipur</option>
                <option value="DEHRADUN">Dehradun</option>
              </select>

              {/* FEATURE 1: Last Refresh Time Display */}
              <div className="text-sm text-gray-500 ml-auto">
                Last updated: {Math.floor((new Date() - lastRefreshTime) / 1000)}s ago
              </div>

              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 active:scale-95"
              >
                Refresh
              </button>
            </div>

            {/* FEATURE 3: Bulk Approve Button - Only show for PENDING filter */}
            {filter === 'PENDING' && stats.pending > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkApproving}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  {bulkApproving ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>APPROVE ALL {stats.pending} PENDING</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Attendance Records Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : attendanceRecords.length === 0 ? (
                // ========== FEATURE 4: BETTER EMPTY STATES ==========
                <div className="text-center py-12">
                  {filter === 'PENDING' ? (
                    <>
                      <div className="text-6xl mb-4">🎉</div>
                      <p className="text-xl font-semibold text-gray-700 mb-2">
                        No Pending Approvals
                      </p>
                      <p className="text-gray-500">
                        All check-ins have been processed!
                      </p>
                    </>
                  ) : filter === 'APPROVED' ? (
                    <>
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-xl font-semibold text-gray-700 mb-2">
                        No Approved Attendance
                      </p>
                      <p className="text-gray-500">
                        Approved check-ins will appear here
                      </p>
                    </>
                  ) : filter === 'REJECTED' ? (
                    <>
                      <div className="text-6xl mb-4">✅</div>
                      <p className="text-xl font-semibold text-gray-700 mb-2">
                        No Rejected Attendance
                      </p>
                      <p className="text-gray-500">
                        Great! All check-ins were valid
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-xl font-semibold text-gray-700 mb-2">
                        No Attendance Records
                      </p>
                      <p className="text-gray-500">
                        No check-ins found for today
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auto Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {record.employeeId?.firstName} {record.employeeId?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.employeeId?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.employeeId?.eId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(record.checkInTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getAutoStatusBadge(record.autoStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.branchId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {record.status === 'PENDING' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(record._id)}
                                disabled={actionLoading === record._id}
                                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-95"
                              >
                                {actionLoading === record._id ? (
                                  <span className="animate-spin mr-2">⏳</span>
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(record._id)}
                                disabled={actionLoading === record._id}
                                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-95"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </button>
                            </div>
                          ) : record.status === 'REJECTED' && record.rejectionReason ? (
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Reason:</span> {record.rejectionReason}
                            </div>
                          ) : (
                            <span className="text-gray-400">No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========== FEATURE 2: REJECTION REASON MODAL ========== */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Attendance</h3>
            <p className="text-gray-600 mb-4">Please select a reason for rejecting this attendance:</p>

            <div className="space-y-3 mb-6">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="reason"
                  value="Not physically present"
                  checked={rejectData.reason === "Not physically present"}
                  onChange={(e) => setRejectData({ ...rejectData, reason: e.target.value })}
                  className="mr-3 w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700">Not physically present</span>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="reason"
                  value="Wrong employee ID"
                  checked={rejectData.reason === "Wrong employee ID"}
                  onChange={(e) => setRejectData({ ...rejectData, reason: e.target.value })}
                  className="mr-3 w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700">Wrong employee ID</span>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="reason"
                  value="Duplicate entry"
                  checked={rejectData.reason === "Duplicate entry"}
                  onChange={(e) => setRejectData({ ...rejectData, reason: e.target.value })}
                  className="mr-3 w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700">Duplicate entry</span>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="reason"
                  value="Other"
                  checked={rejectData.reason === "Other"}
                  onChange={(e) => setRejectData({ ...rejectData, reason: e.target.value })}
                  className="mr-3 w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700">Other</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectData({ id: null, reason: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={!rejectData.reason || actionLoading === rejectData.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                {actionLoading === rejectData.id ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== TOAST NOTIFICATION ========== */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;
