import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const EmployeeCheckin = () => {
  const [searchParams] = useSearchParams();
  // State management
  const [employeeId, setEmployeeId] = useState('');
  const [qrData, setQrData] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoStatus, setAutoStatus] = useState(null);
  const [qrValidated, setQrValidated] = useState(false);

  /**
   * On component mount: Get QR data from URL parameter or fetch current QR
   * Calculate auto status based on current time
   */
  useEffect(() => {
    const qrParam = searchParams.get('qr');

    if (qrParam) {
      try {
        // Decode and parse QR data from URL
        const decoded = decodeURIComponent(qrParam);
        const parsedQR = JSON.parse(decoded);
        setQrData(parsedQR);
        console.log('QR Data loaded from URL:', parsedQR);

        // Automatically validate the QR code
        validateQRCode(parsedQR);
      } catch (error) {
        console.error('Invalid QR parameter:', error);
        setStatus({ type: 'error', message: 'Invalid QR code' });
      }
    } else {
      // Fallback: Fetch current QR if no parameter (for testing)
      fetchCurrentQR();
    }

    calculateAutoStatus();
  }, [searchParams]);

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
    e.preventDefault();

    // Validation
    if (!employeeId || employeeId.trim() === '') {
      setStatus({
        type: 'error',
        message: 'Please enter your Employee ID'
      });
      return;
    }

    if (!qrData) {
      setStatus({
        type: 'error',
        message: 'QR code not loaded. Please scan QR code again.'
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      console.log('Validating QR code...');

      // Step 1: Validate QR code
      const validation = await apiClient.post('/attendance/qr/validate', {
        qrData: qrData
      });

      console.log('Validation result:', validation.data);

      if (!validation.data.valid) {
        setStatus({
          type: 'error',
          message: validation.data.reason || 'QR code is invalid or expired. Please scan again.'
        });
        setLoading(false);
        return;
      }

      console.log('Marking attendance...');

      // Step 2: Mark attendance
      const response = await apiClient.post('/attendance/checkin', {
        employeeId: employeeId.trim(),
        qrCodeId: qrData.qrCodeId,
        branchId: qrData.branchId
      });

      console.log('Attendance response:', response.data);

      // Success - Show pending approval message
      const attendanceStatus = response.data.attendance?.autoStatus || autoStatus?.label || 'Marked';
      setStatus({
        type: 'success',
        message: '✓ Attendance marked successfully!',
        details: {
          employeeId: employeeId.trim(),
          time: getCurrentTime(),
          status: attendanceStatus,
          pending: true
        }
      });

      // Clear form after 5 seconds
      setTimeout(() => {
        setEmployeeId('');
        setStatus(null);
      }, 5000);

    } catch (error) {
      console.error('Error marking attendance:', error);

      let errorMessage = 'Failed to mark attendance. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setStatus({
        type: 'error',
        message: errorMessage
      });
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
          <div className="text-6xl mb-4">📍</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Mark Your Attendance
          </h1>
          <p className="text-gray-600 text-base">
            {getCurrentDate()}
          </p>
        </div>

        {/* QR Status Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 space-y-4 border border-gray-200">
          {/* QR Validation Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-semibold text-base">QR Code:</span>
            <span className={`font-bold text-base ${qrValidated ? 'text-green-600' : 'text-gray-400'}`}>
              {qrValidated ? '✓ Valid' : '⏳ Loading...'}
            </span>
          </div>

          {/* Branch */}
          {qrData && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold text-base">Branch:</span>
              <span className="text-gray-900 font-bold text-base">{qrData.branchId} Office</span>
            </div>
          )}

          {/* Current Time */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-semibold text-base">Time:</span>
            <span className="text-gray-900 font-bold text-base">{getCurrentTime()}</span>
          </div>

          {/* Auto Status */}
          {autoStatus && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold text-base">Status:</span>
              <span className={`font-bold text-xl ${autoStatus.color}`}>
                {autoStatus.label}
              </span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {autoStatus && (
          <div className={`${autoStatus.bg} ${autoStatus.border} border-2 rounded-xl p-5 mb-6 text-center`}>
            <p className={`${autoStatus.color} font-bold text-2xl`}>
              {autoStatus.label}
            </p>
          </div>
        )}

        {/* Employee ID Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="employeeId" className="block text-gray-700 font-semibold mb-3 text-lg">
              Enter Employee ID:
            </label>
            <input
              type="text"
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g., EMP123"
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-medium"
              disabled={loading || !qrValidated}
              autoFocus
              autoComplete="off"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !qrValidated}
            className={`w-full py-5 rounded-xl font-bold text-xl transition-all duration-200 ${
              loading || !qrValidated
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg'
            }`}
            style={{ minHeight: '60px' }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Marking Attendance...</span>
              </div>
            ) : (
              'MARK ATTENDANCE'
            )}
          </button>
        </form>

        {/* Status Messages */}
        {status && (
          <div className={`mt-6 p-6 rounded-xl ${
            status.type === 'success'
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-red-50 border-2 border-red-200'
          }`}>
            <div className="text-center mb-3">
              <div className={`text-4xl mb-2 ${
                status.type === 'success' ? '' : ''
              }`}>
                {status.type === 'success' ? '✓' : '✗'}
              </div>
              <p className={`font-bold text-xl ${
                status.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {status.message}
              </p>
            </div>

            {/* Success Details */}
            {status.details && (
              <div className="space-y-3">
                <div className="border-t border-green-200 pt-3 mt-3">
                  <div className="space-y-2 text-base text-green-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Employee ID:</span>
                      <span className="font-bold">{status.details.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Time:</span>
                      <span className="font-bold">{status.details.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span className="font-bold">{status.details.status}</span>
                    </div>
                  </div>
                </div>

                {/* Pending Approval Message */}
                {status.details.pending && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <div className="text-2xl">⏳</div>
                      <div>
                        <p className="font-semibold text-base">Waiting for manager approval</p>
                        <p className="text-sm mt-1">Your attendance has been recorded and is pending approval.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-base text-gray-500">Need help? Contact HR support</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCheckin;
