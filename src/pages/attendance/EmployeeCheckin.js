import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const EmployeeCheckin = () => {
  // State management
  const [employeeId, setEmployeeId] = useState('');
  const [qrData, setQrData] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoStatus, setAutoStatus] = useState(null);
  const [qrValidated, setQrValidated] = useState(false);

  /**
   * On component mount: Fetch current QR (simulates scanning)
   * Calculate auto status based on current time
   */
  useEffect(() => {
    fetchCurrentQR();
    calculateAutoStatus();
  }, []);

  /**
   * Fetch current QR code (simulates scanning QR at office entrance)
   * In production, this would be replaced with actual QR scanner
   */
  const fetchCurrentQR = async () => {
    try {
      console.log('Fetching current QR code...');
      const response = await apiClient.get('/attendance/qr/active?branchId=JAIPUR');

      const qrDataFromApi = response.data.qrData || response.data;
      setQrData(qrDataFromApi);

      console.log('QR code fetched:', qrDataFromApi);

      // Automatically validate the QR code
      await validateQRCode(qrDataFromApi);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      setStatus({
        type: 'error',
        message: 'Failed to load QR code. Please refresh the page.'
      });
    }
  };

  /**
   * Validate QR code with backend
   */
  const validateQRCode = async (qrDataToValidate) => {
    try {
      const response = await apiClient.post('/attendance/qr/validate', {
        qrData: qrDataToValidate
      });

      if (response.data.valid) {
        setQrValidated(true);
        console.log('QR code validated successfully');
      } else {
        setQrValidated(false);
        setStatus({
          type: 'error',
          message: response.data.reason || 'Invalid QR code'
        });
      }
    } catch (error) {
      console.error('Error validating QR code:', error);
      setQrValidated(false);
      setStatus({
        type: 'error',
        message: 'QR code validation failed. Please try again.'
      });
    }
  };

  /**
   * Calculate auto status based on current time
   * Before 10:00 AM → FULL_DAY (green)
   * 10:00-11:00 AM → LATE (yellow)
   * 11:00 AM-2:00 PM → HALF_DAY (orange)
   * After 2:00 PM → ABSENT (red)
   */
  const calculateAutoStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;

    // Define time boundaries
    const tenAM = 10 * 60; // 600 minutes
    const elevenAM = 11 * 60; // 660 minutes
    const twoPM = 14 * 60; // 840 minutes

    let status;
    if (currentTimeInMinutes < tenAM) {
      status = {
        label: 'ON TIME ✓',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
      };
    } else if (currentTimeInMinutes >= tenAM && currentTimeInMinutes < elevenAM) {
      status = {
        label: 'LATE ⚠️',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      };
    } else if (currentTimeInMinutes >= elevenAM && currentTimeInMinutes < twoPM) {
      status = {
        label: 'HALF DAY ⚠️',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200'
      };
    } else {
      status = {
        label: 'ABSENT ✗',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      };
    }

    setAutoStatus(status);
    console.log('Auto status calculated:', status.label);
  };

  /**
   * Get current time formatted as "10:33 AM"
   */
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Handle form submission - Mark attendance
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form default behavior

    // Validation
    if (!employeeId || employeeId.trim() === '') {
      setStatus({ type: 'error', message: 'Please enter your Employee ID' });
      return;
    }

    if (!qrData) {
      setStatus({ type: 'error', message: 'QR code not loaded. Please refresh.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Step 1: Validate QR
      console.log('Validating QR...', qrData);
      const validation = await apiClient.post('/attendance/qr/validate', {
        qrData: qrData
      });

      console.log('QR Validation response:', validation.data);

      if (!validation.data.valid) {
        setStatus({
          type: 'error',
          message: validation.data.reason || 'QR code is invalid'
        });
        setLoading(false);
        return;
      }

      // Step 2: Mark attendance
      console.log('Marking attendance...');
      console.log('Request payload:', {
        employeeId: employeeId.trim(),
        qrCodeId: qrData.qrCodeId,
        branchId: qrData.branchId
      });

      const response = await apiClient.post('/attendance/checkin', {
        employeeId: employeeId.trim(),
        qrCodeId: qrData.qrCodeId,
        branchId: qrData.branchId
      });

      console.log('Attendance response:', response.data);

      // Success
      const attendanceStatus = response.data.attendance?.autoStatus || autoStatus?.label || 'Marked';
      setStatus({
        type: 'success',
        message: `Attendance marked successfully! Status: ${attendanceStatus}`,
        details: {
          employeeId: employeeId.trim(),
          time: getCurrentTime(),
          status: attendanceStatus
        }
      });

      // Clear form after 3 seconds
      setTimeout(() => {
        setEmployeeId('');
        setStatus(null);
        // Refresh QR code for next use
        fetchCurrentQR();
        calculateAutoStatus();
      }, 3000);

    } catch (error) {
      console.error('Error details:', error);
      console.error('Error response:', error.response);

      const errorMsg = error.response?.data?.message || error.message || 'Failed to mark attendance';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get current date formatted nicely
   */
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📍</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mark Your Attendance
          </h1>
          <p className="text-gray-600 text-sm">
            {getCurrentDate()}
          </p>
        </div>

        {/* QR Status Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
          {/* QR Validation Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">QR Code:</span>
            <span className={`font-semibold ${qrValidated ? 'text-green-600' : 'text-gray-400'}`}>
              {qrValidated ? '✓ Valid' : '⏳ Loading...'}
            </span>
          </div>

          {/* Branch */}
          {qrData && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Branch:</span>
              <span className="text-gray-800 font-semibold">{qrData.branchId} Office</span>
            </div>
          )}

          {/* Current Time */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Time:</span>
            <span className="text-gray-800 font-semibold">{getCurrentTime()}</span>
          </div>

          {/* Auto Status */}
          {autoStatus && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Status:</span>
              <span className={`font-bold text-lg ${autoStatus.color}`}>
                {autoStatus.label}
              </span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {autoStatus && (
          <div className={`${autoStatus.bg} ${autoStatus.border} border-2 rounded-xl p-4 mb-6 text-center`}>
            <p className={`${autoStatus.color} font-bold text-xl`}>
              {autoStatus.label}
            </p>
          </div>
        )}

        {/* Employee ID Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="employeeId" className="block text-gray-700 font-semibold mb-2">
              Enter Employee ID:
            </label>
            <input
              type="text"
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g., EMP123"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              disabled={loading || !qrValidated}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !qrValidated}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
              loading || !qrValidated
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Marking Attendance...</span>
              </div>
            ) : (
              'MARK ATTENDANCE'
            )}
          </button>
        </form>

        {/* Status Messages */}
        {status && (
          <div className={`mt-6 p-4 rounded-xl ${
            status.type === 'success'
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-red-50 border-2 border-red-200'
          }`}>
            <p className={`font-semibold text-center ${
              status.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {status.message}
            </p>

            {/* Success Details */}
            {status.details && (
              <div className="mt-3 space-y-1 text-sm text-green-600">
                <p>Employee ID: <strong>{status.details.employeeId}</strong></p>
                <p>Time: <strong>{status.details.time}</strong></p>
                <p>Status: <strong>{status.details.status}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? Contact HR support</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCheckin;
