import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Save, RefreshCw } from 'lucide-react';
import Sidebar from './Sidebar';
import apiClient from '../../services/apiClient';
import Toast from '../../components/Toast';

const ConfigManagement = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const orgId = "673db4bb4ea85b50f50f20d4"; // Temp orgId

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/config/${orgId}`);
      setConfig(res.data.config);
    } catch (error) {
      console.error('Error fetching config:', error);
      showToast('Failed to load configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/config/${orgId}`, config);
      showToast('✓ Configuration saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving config:', error);
      showToast('Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset to default settings? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(`/config/${orgId}/reset`);
      await fetchConfig();
      showToast('Configuration reset to defaults', 'success');
    } catch (error) {
      console.error('Error resetting config:', error);
      showToast('Failed to reset configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  if (loading && !config) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="bg-white h-20 flex items-center justify-between px-6 m-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Link
              to="/admin"
              className="bg-gray-300 text-black py-2 px-2 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 mr-4"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-4xl font-bold text-black">
              ⚙️ Organization Settings
            </h1>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Attendance Timing */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 transition-all duration-200 hover:shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ⏰ Attendance Timing Rules
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Define cutoff times for attendance status calculation
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Day Before
                </label>
                <input
                  type="time"
                  value={config.attendanceTiming.fullDayBefore}
                  onChange={(e) => setConfig({
                    ...config,
                    attendanceTiming: { ...config.attendanceTiming, fullDayBefore: e.target.value }
                  })}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Check-in before this time = Full Day</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Late Before
                </label>
                <input
                  type="time"
                  value={config.attendanceTiming.lateBefore}
                  onChange={(e) => setConfig({
                    ...config,
                    attendanceTiming: { ...config.attendanceTiming, lateBefore: e.target.value }
                  })}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Between Full Day and this time = Late</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Half Day Before
                </label>
                <input
                  type="time"
                  value={config.attendanceTiming.halfDayBefore}
                  onChange={(e) => setConfig({
                    ...config,
                    attendanceTiming: { ...config.attendanceTiming, halfDayBefore: e.target.value }
                  })}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Between Late and this time = Half Day</p>
              </div>
            </div>
          </div>

          {/* Grace Period */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 transition-all duration-200 hover:shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🕐 Grace Period
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Allow a grace period for late arrivals
            </p>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.gracePeriod.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    gracePeriod: { ...config.gracePeriod, enabled: e.target.checked }
                  })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Enable Grace Period</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={config.gracePeriod.minutes}
                  disabled={!config.gracePeriod.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    gracePeriod: { ...config.gracePeriod, minutes: parseInt(e.target.value) || 0 }
                  })}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-24 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <span className="text-sm text-gray-700">minutes</span>
              </div>
            </div>
          </div>

          {/* Deduction Rules */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 transition-all duration-200 hover:shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📉 Deduction Rules
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure how late arrivals and half days affect attendance
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={config.deductions.lateRule.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    deductions: {
                      ...config.deductions,
                      lateRule: { ...config.deductions.lateRule, enabled: e.target.checked }
                    }
                  })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    min="1"
                    value={config.deductions.lateRule.count}
                    disabled={!config.deductions.lateRule.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      deductions: {
                        ...config.deductions,
                        lateRule: { ...config.deductions.lateRule, count: parseInt(e.target.value) || 1 }
                      }
                    })}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-20 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <span className="font-medium">LATE entries = 1 ABSENT</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={config.deductions.halfDayRule.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    deductions: {
                      ...config.deductions,
                      halfDayRule: { ...config.deductions.halfDayRule, enabled: e.target.checked }
                    }
                  })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    min="1"
                    value={config.deductions.halfDayRule.count}
                    disabled={!config.deductions.halfDayRule.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      deductions: {
                        ...config.deductions,
                        halfDayRule: { ...config.deductions.halfDayRule, count: parseInt(e.target.value) || 1 }
                      }
                    })}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-20 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <span className="font-medium">HALF_DAY entries = 1 ABSENT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Policy */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 transition-all duration-200 hover:shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🏖️ Leave Policy (Per Year)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Set annual leave allowances for employees
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Casual Leave
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.leavePolicy.casualLeave}
                  onChange={(e) => setConfig({
                    ...config,
                    leavePolicy: { ...config.leavePolicy, casualLeave: parseInt(e.target.value) || 0 }
                  })}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Days per year</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sick Leave
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.leavePolicy.sickLeave}
                  onChange={(e) => setConfig({
                    ...config,
                    leavePolicy: { ...config.leavePolicy, sickLeave: parseInt(e.target.value) || 0 }
                  })}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Days per year</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Leave
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.leavePolicy.paidLeave}
                  onChange={(e) => setConfig({
                    ...config,
                    leavePolicy: { ...config.leavePolicy, paidLeave: parseInt(e.target.value) || 0 }
                  })}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Days per year</p>
              </div>
            </div>
          </div>

          {/* QR Code Settings */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 transition-all duration-200 hover:shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📱 QR Code Settings
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure QR code behavior for attendance
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Expiry (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.qrCodeSettings.expiryMinutes}
                  onChange={(e) => setConfig({
                    ...config,
                    qrCodeSettings: { ...config.qrCodeSettings, expiryMinutes: parseInt(e.target.value) || 1 }
                  })}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">How long QR codes remain valid</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.qrCodeSettings.autoRefresh}
                    onChange={(e) => setConfig({
                      ...config,
                      qrCodeSettings: { ...config.qrCodeSettings, autoRefresh: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Auto-refresh QR codes</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.qrCodeSettings.allowMultipleBranches}
                    onChange={(e) => setConfig({
                      ...config,
                      qrCodeSettings: { ...config.qrCodeSettings, allowMultipleBranches: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Allow multiple branches</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={fetchConfig}
              disabled={loading}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:bg-gray-300 transition-all duration-200 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
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

export default ConfigManagement;
