import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const ManagerDashboard = () => {
  // State management
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('PENDING');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Hardcoded manager ID (replace with auth later)
  const MANAGER_ID = "673db4bb4ea85b50f50f20d4";
  const BRANCH_ID = "JAIPUR";

  /**
   * Fetch today's attendance records
   */
  const fetchAttendance = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      console.log('Fetching today\'s attendance...');
      const response = await apiClient.get(`/attendance/today?branch=${BRANCH_ID}`);

      console.log('Attendance data:', response.data);
      setAttendanceList(response.data.attendance || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  /**
   * Approve attendance
   */
  const handleApprove = async (id, employeeName) => {
    try {
      setActionLoading(id);
      console.log(`Approving attendance ${id}...`);

      const response = await apiClient.put(`/attendance/approve/${id}`, {
        approvedBy: MANAGER_ID
      });

      console.log('Approval response:', response.data);

      // Refresh data
      await fetchAttendance(false);

      // Show success feedback
      alert(`✓ Approved attendance for ${employeeName}`);
    } catch (error) {
      console.error('Error approving attendance:', error);
      alert('Failed to approve attendance. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Open reject modal
   */
  const openRejectModal = (attendance) => {
    setSelectedAttendance(attendance);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  /**
   * Close reject modal
   */
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedAttendance(null);
    setRejectionReason('');
  };

  /**
   * Reject attendance
   */
  const handleReject = async () => {
    if (!rejectionReason) {
      alert('Please select a rejection reason');
      return;
    }

    try {
      setActionLoading(selectedAttendance._id);
      console.log(`Rejecting attendance ${selectedAttendance._id}...`);

      const response = await apiClient.put(`/attendance/reject/${selectedAttendance._id}`, {
        approvedBy: MANAGER_ID,
        rejectionReason: rejectionReason
      });

      console.log('Rejection response:', response.data);

      // Close modal
      closeRejectModal();

      // Refresh data
      await fetchAttendance(false);

      // Show success feedback
      const employeeName = `${selectedAttendance.employeeId.firstName} ${selectedAttendance.employeeId.lastName}`;
      alert(`✗ Rejected attendance for ${employeeName}`);
    } catch (error) {
      console.error('Error rejecting attendance:', error);
      alert('Failed to reject attendance. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Bulk approve all pending attendance
   */
  const handleBulkApprove = async () => {
    const pendingList = attendanceList.filter(att => att.status === 'PENDING');

    if (pendingList.length === 0) {
      alert('No pending attendance to approve');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to approve all ${pendingList.length} pending attendance records?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      console.log(`Bulk approving ${pendingList.length} records...`);

      // Approve each pending attendance
      const approvalPromises = pendingList.map(att =>
        apiClient.put(`/attendance/approve/${att._id}`, {
          approvedBy: MANAGER_ID
        })
      );

      await Promise.all(approvalPromises);

      // Refresh data
      await fetchAttendance(false);

      alert(`✓ Successfully approved ${pendingList.length} attendance records`);
    } catch (error) {
      console.error('Error bulk approving:', error);
      alert('Some approvals failed. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format time to readable format (e.g., "09:15 AM")
   */
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Calculate time since last update
   */
  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date() - lastUpdated) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  /**
   * Get status badge styling
   */
  const getStatusBadgeStyle = (autoStatus) => {
    switch (autoStatus) {
      case 'FULL_DAY':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'HALF_DAY':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  /**
   * Get status label display
   */
  const getStatusLabel = (autoStatus) => {
    switch (autoStatus) {
      case 'FULL_DAY':
        return 'ON TIME ✓';
      case 'LATE':
        return 'LATE ⚠️';
      case 'HALF_DAY':
        return 'HALF DAY ⚠️';
      default:
        return autoStatus;
    }
  };

  /**
   * Filter attendance by status
   */
  const filteredAttendance = attendanceList.filter(att => att.status === filter);

  /**
   * Count by status
   */
  const pendingCount = attendanceList.filter(att => att.status === 'PENDING').length;
  const approvedCount = attendanceList.filter(att => att.status === 'APPROVED').length;
  const rejectedCount = attendanceList.filter(att => att.status === 'REJECTED').length;

  /**
   * Auto-refresh every 30 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAttendance(false);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  /**
   * Fetch on mount
   */
  useEffect(() => {
    fetchAttendance();
  }, []);

  /**
   * Update time display every second
   */
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Attendance Approval
              </h1>
              <p className="text-gray-600 mt-1">{formatDate(new Date())}</p>
              <p className="text-sm text-gray-500 mt-1">Branch: {BRANCH_ID}</p>
            </div>
            <div className="text-right">
              <button
                onClick={() => fetchAttendance()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {getTimeSinceUpdate()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-700">{pendingCount}</p>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{approvedCount}</p>
              <p className="text-sm font-medium text-green-600">Approved</p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
              <p className="text-sm font-medium text-red-600">Rejected</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('PENDING')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                filter === 'PENDING'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                filter === 'APPROVED'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                filter === 'REJECTED'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading attendance data...</p>
          </div>
        )}

        {/* Attendance List */}
        {!loading && (
          <div className="space-y-4">
            {filteredAttendance.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">
                  {filter === 'PENDING' && '⏳'}
                  {filter === 'APPROVED' && '✓'}
                  {filter === 'REJECTED' && '✗'}
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  {filter === 'PENDING' && 'No pending approvals 🎉'}
                  {filter === 'APPROVED' && 'No approved attendance yet'}
                  {filter === 'REJECTED' && 'No rejected attendance'}
                </p>
                <p className="text-gray-500">
                  {filter === 'PENDING' && 'All caught up! Check back later.'}
                  {filter === 'APPROVED' && 'Approved records will appear here'}
                  {filter === 'REJECTED' && 'Rejected records will appear here'}
                </p>
              </div>
            ) : (
              // Attendance Cards
              filteredAttendance.map((attendance) => {
                const employee = attendance.employeeId;
                const isProcessing = actionLoading === attendance._id;

                return (
                  <div
                    key={attendance._id}
                    className={`bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl ${
                      filter === 'PENDING' ? 'border-l-4 border-yellow-500' :
                      filter === 'APPROVED' ? 'border-l-4 border-green-500' :
                      'border-l-4 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Employee Info */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {employee.firstName} {employee.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              ID: {employee.eId}
                            </p>
                          </div>
                        </div>

                        {/* Time and Status */}
                        <div className="flex flex-wrap gap-3 mb-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-lg">🕐</span>
                            <span className="font-semibold">
                              {formatTime(attendance.checkInTime)}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeStyle(attendance.autoStatus)}`}>
                              {getStatusLabel(attendance.autoStatus)}
                            </span>
                          </div>
                        </div>

                        {/* Additional Info for Approved/Rejected */}
                        {attendance.status === 'APPROVED' && attendance.approvedAt && (
                          <p className="text-sm text-green-600">
                            ✓ Approved at {formatTime(attendance.approvedAt)}
                          </p>
                        )}
                        {attendance.status === 'REJECTED' && (
                          <div className="text-sm text-red-600">
                            <p>✗ Rejected at {formatTime(attendance.approvedAt)}</p>
                            {attendance.rejectionReason && (
                              <p className="mt-1">Reason: {attendance.rejectionReason}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - Only for PENDING */}
                      {filter === 'PENDING' && (
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleApprove(attendance._id, `${employee.firstName} ${employee.lastName}`)}
                            disabled={isProcessing}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[120px]"
                          >
                            {isProcessing ? 'Processing...' : '✓ APPROVE'}
                          </button>
                          <button
                            onClick={() => openRejectModal(attendance)}
                            disabled={isProcessing}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[120px]"
                          >
                            {isProcessing ? 'Processing...' : '✗ REJECT'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Bulk Approve Button */}
        {filter === 'PENDING' && pendingCount > 0 && !loading && (
          <div className="mt-6">
            <button
              onClick={handleBulkApprove}
              className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold text-lg shadow-lg"
            >
              ✓ APPROVE ALL PENDING ({pendingCount})
            </button>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedAttendance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Reject Attendance
              </h2>
              <p className="text-gray-600 mb-4">
                Employee: <strong>{selectedAttendance.employeeId.firstName} {selectedAttendance.employeeId.lastName}</strong>
              </p>

              {/* Rejection Reasons */}
              <div className="space-y-2 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Select Rejection Reason:
                </p>
                {[
                  'Not physically present',
                  'Wrong Employee ID',
                  'Duplicate entry',
                  'Late without approval',
                  'Other'
                ].map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={rejectionReason === reason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeRejectModal}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManagerDashboard;
