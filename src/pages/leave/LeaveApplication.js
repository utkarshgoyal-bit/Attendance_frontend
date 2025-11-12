import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Clock, TrendingUp } from 'lucide-react';
import apiClient from '../../services/apiClient';
import Toast from '../../components/Toast';

const LeaveApplication = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'CL',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Fetch leave balance
    fetchBalance();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const fetchBalance = async () => {
    try {
      const empId = "673db4bb4ea85b50f50f20d4"; // Temp - replace with auth
      const res = await apiClient.get(`/leaves/balance/${empId}`);
      setBalance(res.data.balance);
      setFormData(prev => ({ ...prev, employeeId: empId }));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      showToast('Failed to load leave balance', 'error');
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const days = calculateDays();

      // Validate dates
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        showToast('End date must be after start date', 'error');
        setLoading(false);
        return;
      }

      await apiClient.post('/leaves/apply', {
        ...formData,
        numberOfDays: days
      });

      showToast('Leave application submitted successfully!', 'success');

      // Reset form
      setFormData({
        ...formData,
        startDate: '',
        endDate: '',
        reason: ''
      });

      fetchBalance();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to apply leave', 'error');
    }

    setLoading(false);
  };

  const leaveTypes = {
    CL: 'Casual Leave',
    SL: 'Sick Leave',
    EL: 'Earned Leave',
    LWP: 'Leave Without Pay'
  };

  const getBalanceForType = (type) => {
    if (!balance) return { remaining: 0, total: 0 };

    const typeMap = {
      'CL': 'casualLeave',
      'SL': 'sickLeave',
      'EL': 'earnedLeave',
      'LWP': null
    };

    const balanceKey = typeMap[type];
    if (!balanceKey) return { remaining: '∞', total: '∞' };

    return balance[balanceKey] || { remaining: 0, total: 0 };
  };

  const currentBalance = getBalanceForType(formData.leaveType);
  const requestedDays = calculateDays();
  const isBalanceSufficient = formData.leaveType === 'LWP' || currentBalance.remaining >= requestedDays;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Apply for Leave
          </h1>
          <p className="text-gray-600 mt-2">Submit your leave application and track your balance</p>
        </div>

        {/* Leave Balance Cards */}
        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg shadow-md border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-700">Casual Leave</p>
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-800">
                {balance.casualLeave.remaining}
                <span className="text-lg font-normal text-blue-600">/{balance.casualLeave.total}</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">days remaining</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg shadow-md border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-700">Sick Leave</p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-800">
                {balance.sickLeave.remaining}
                <span className="text-lg font-normal text-green-600">/{balance.sickLeave.total}</span>
              </p>
              <p className="text-xs text-green-600 mt-1">days remaining</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg shadow-md border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-700">Earned Leave</p>
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-800">
                {balance.earnedLeave.remaining}
                <span className="text-lg font-normal text-purple-600">/{balance.earnedLeave.total}</span>
              </p>
              <p className="text-xs text-purple-600 mt-1">days remaining</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg shadow-md border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-orange-700">LWP</p>
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-800">∞</p>
              <p className="text-xs text-orange-600 mt-1">without pay</p>
            </div>
          </div>
        )}

        {/* Application Form */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Leave Application Form</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                {Object.entries(leaveTypes).map(([key, val]) => (
                  <option key={key} value={key}>{val}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Available: <span className="font-semibold">{currentBalance.remaining}</span> days
              </p>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Days Calculation */}
            {formData.startDate && formData.endDate && (
              <div className={`p-4 rounded-lg border-2 ${isBalanceSufficient ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Leave Days</p>
                    <p className="text-2xl font-bold text-gray-900">{requestedDays} days</p>
                  </div>
                  {!isBalanceSufficient && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-700">Insufficient Balance</p>
                      <p className="text-xs text-red-600">You need {requestedDays - currentBalance.remaining} more days</p>
                    </div>
                  )}
                  {isBalanceSufficient && formData.leaveType !== 'LWP' && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-700">Balance After</p>
                      <p className="text-xl font-bold text-green-800">{currentBalance.remaining - requestedDays} days</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows="4"
                placeholder="Please provide a reason for your leave..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.reason.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isBalanceSufficient}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Submit Leave Application</span>
                </>
              )}
            </button>

            {!isBalanceSufficient && formData.startDate && formData.endDate && (
              <p className="text-center text-red-600 text-sm">
                Cannot submit: Insufficient leave balance for selected dates
              </p>
            )}
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your leave application will be sent to your manager for approval.
            You will be notified once your application is reviewed. Leave balance will be deducted only after approval.
          </p>
        </div>
      </div>

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

export default LeaveApplication;
