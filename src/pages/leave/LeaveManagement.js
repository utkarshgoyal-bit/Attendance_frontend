import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Filter, RefreshCw } from 'lucide-react';
import apiClient from '../../services/apiClient';
import Toast from '../../components/Toast';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [toast, setToast] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [rejectionModal, setRejectionModal] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');

  useEffect(() => {
    fetchLeaves();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLeaves(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const fetchLeaves = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const res = await apiClient.get('/leaves/');
      setLeaves(res.data.leaves);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
      if (!silent) {
        showToast('Failed to load leaves', 'error');
      }
    }

    if (!silent) setLoading(false);
  };

  const filterLeaves = () => {
    const filtered = leaves.filter(leave => leave.status === activeTab);
    setFilteredLeaves(filtered);
  };

  const handleApprove = async (leaveId) => {
    try {
      const managerId = "673db4bb4ea85b50f50f20d4"; // Replace with actual manager ID from auth
      await apiClient.put(`/leaves/approve/${leaveId}`, {
        approvedBy: managerId
      });

      showToast('Leave approved successfully', 'success');
      fetchLeaves();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to approve leave', 'error');
    }
  };

  const openRejectionModal = (leave) => {
    setRejectionModal(leave);
    setSelectedReason('');
  };

  const closeRejectionModal = () => {
    setRejectionModal(null);
    setSelectedReason('');
  };

  const handleReject = async () => {
    if (!selectedReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }

    try {
      const managerId = "673db4bb4ea85b50f50f20d4"; // Replace with actual manager ID
      await apiClient.put(`/leaves/reject/${rejectionModal._id}`, {
        approvedBy: managerId,
        rejectionReason: selectedReason
      });

      showToast('Leave rejected', 'success');
      closeRejectionModal();
      fetchLeaves();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reject leave', 'error');
    }
  };

  const handleBulkApprove = async () => {
    const pendingLeaves = leaves.filter(l => l.status === 'PENDING');

    if (pendingLeaves.length === 0) {
      showToast('No pending leaves to approve', 'error');
      return;
    }

    if (!window.confirm(`Approve all ${pendingLeaves.length} pending leaves?`)) {
      return;
    }

    try {
      const managerId = "673db4bb4ea85b50f50f20d4";
      const leaveIds = pendingLeaves.map(l => l._id);

      const res = await apiClient.post('/leaves/bulk-approve', {
        leaveIds,
        approvedBy: managerId
      });

      showToast(`${res.data.successCount} leaves approved successfully`, 'success');
      fetchLeaves();
    } catch (error) {
      showToast(error.response?.data?.message || 'Bulk approval failed', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLeaveTypeBadge = (type) => {
    const badges = {
      CL: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Casual Leave' },
      SL: { bg: 'bg-green-100', text: 'text-green-800', label: 'Sick Leave' },
      EL: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Earned Leave' },
      LWP: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Leave Without Pay' }
    };

    const badge = badges[type] || badges.CL;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const tabs = [
    { id: 'PENDING', label: 'Pending', icon: Clock, color: 'orange' },
    { id: 'APPROVED', label: 'Approved', icon: CheckCircle, color: 'green' },
    { id: 'REJECTED', label: 'Rejected', icon: XCircle, color: 'red' }
  ];

  const getTabCount = (status) => {
    return leaves.filter(l => l.status === status).length;
  };

  const rejectionReasons = [
    'Insufficient staffing during requested period',
    'Peak business period - leave not feasible',
    'Overlapping with other team members leave',
    'Insufficient notice period provided'
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Leave Management
              </h1>
              <p className="text-gray-600 mt-2">Review and manage employee leave applications</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-700">
                  {lastRefreshTime.toLocaleTimeString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => fetchLeaves()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leaves</p>
                <p className="text-3xl font-bold text-gray-800">{leaves.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{getTabCount('PENDING')}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600">{getTabCount('APPROVED')}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg shadow-md border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{getTabCount('REJECTED')}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-8">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const count = getTabCount(tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? `border-${tab.color}-500 text-${tab.color}-600`
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? `bg-${tab.color}-100 text-${tab.color}-700`
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bulk Actions */}
          {activeTab === 'PENDING' && getTabCount('PENDING') > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {getTabCount('PENDING')} pending leave application(s)
              </p>
              <button
                onClick={handleBulkApprove}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Approve All
              </button>
            </div>
          )}

          {/* Leaves List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading leaves...</p>
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No {activeTab.toLowerCase()} leaves
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'PENDING'
                    ? 'All caught up! No leaves pending approval.'
                    : `No leaves have been ${activeTab.toLowerCase()} yet.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeaves.map(leave => (
                  <div
                    key={leave._id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start justify-between">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ({leave.employeeId?.eId})
                          </span>
                          {getLeaveTypeBadge(leave.leaveType)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {leave.numberOfDays} day(s)
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">Applied On</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(leave.appliedDate)}
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Reason</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {leave.reason}
                          </p>
                        </div>

                        {leave.status === 'REJECTED' && leave.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-xs text-red-700 font-medium mb-1">
                              Rejection Reason
                            </p>
                            <p className="text-sm text-red-800">{leave.rejectionReason}</p>
                          </div>
                        )}
                      </div>

                      {/* Right Section - Actions */}
                      {activeTab === 'PENDING' && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleApprove(leave._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectionModal(leave)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}

                      {activeTab !== 'PENDING' && (
                        <div className="ml-4">
                          {leave.approvedDate && (
                            <p className="text-xs text-gray-500">
                              {activeTab === 'APPROVED' ? 'Approved' : 'Rejected'} on{' '}
                              {formatDate(leave.approvedDate)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reject Leave Application</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Employee: <span className="font-semibold">
                  {rejectionModal.employeeId?.firstName} {rejectionModal.employeeId?.lastName}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Leave Period: {formatDate(rejectionModal.startDate)} - {formatDate(rejectionModal.endDate)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <div className="space-y-2">
                {rejectionReasons.map((reason, idx) => (
                  <label key={idx} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="other"
                    checked={selectedReason === 'other'}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">Other (specify below)</span>
                </label>
              </div>

              {selectedReason === 'other' && (
                <textarea
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="3"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeRejectionModal}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={4000}
        />
      )}
    </div>
  );
};

export default LeaveManagement;
