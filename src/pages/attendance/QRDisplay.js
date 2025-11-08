import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '../../services/apiClient';

const QRDisplay = () => {
  // State management
  const [qrData, setQrData] = useState(null);
  const [countdown, setCountdown] = useState(240); // 4 minutes in seconds
  const [checkInCount, setCheckInCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration
  const BRANCH_ID = 'JAIPUR';
  const REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes in milliseconds
  const QR_SIZE = 400; // QR code size in pixels

  /**
   * Fetch QR code data from backend
   * Called on mount and every 4 minutes
   */
  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call API to get active QR code
      const response = await apiClient.get(`/attendance/qr/active?branchId=${BRANCH_ID}`);

      console.log('QR Code fetched:', response.data);

      // Extract QR data from response
      const qrDataFromApi = response.data.qrData || response.data;
      setQrData(qrDataFromApi);

      // Reset countdown to 4 minutes
      setCountdown(240);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching QR code:', err);
      setError('Failed to load QR code. Please refresh the page.');
      setLoading(false);
    }
  };

  /**
   * Fetch today's check-in count
   * Optional feature to show number of check-ins
   */
  const fetchCheckInCount = async () => {
    try {
      const response = await apiClient.get(`/attendance/today?branchId=${BRANCH_ID}&status=APPROVED`);
      const count = response.data.count || response.data.attendance?.length || 0;
      setCheckInCount(count);
    } catch (err) {
      console.error('Error fetching check-in count:', err);
      // Non-critical, so we don't show error to user
    }
  };

  /**
   * Effect: Fetch QR code on component mount
   */
  useEffect(() => {
    fetchQRCode();
    fetchCheckInCount();
  }, []);

  /**
   * Effect: Refresh QR code every 4 minutes
   * This ensures the QR never expires (5 min expiry, 4 min refresh)
   */
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing QR code...');
      fetchQRCode();
      fetchCheckInCount();
    }, REFRESH_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  /**
   * Effect: Countdown timer (updates every second)
   * Shows time remaining until next QR refresh
   */
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          return 240; // Reset to 4 minutes when it reaches 0
        }
        return prevCountdown - 1;
      });
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(countdownInterval);
  }, []);

  /**
   * Format countdown seconds to MM:SS format
   */
  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Get current date formatted nicely
   */
  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  /**
   * Get current time formatted
   */
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Loading state
  if (loading && !qrData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-2xl font-semibold text-gray-700">Loading QR Code...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !qrData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-xl max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchQRCode}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full">

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {BRANCH_ID} OFFICE
          </h1>
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            ATTENDANCE CHECK-IN
          </h2>
          <p className="text-lg text-gray-600">
            {getCurrentDate()}
          </p>
        </div>

        <div className="border-t-2 border-gray-200 my-6"></div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center mb-8">
          {qrData && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-blue-200">
              <QRCodeSVG
                value={JSON.stringify(qrData)}
                size={QR_SIZE}
                level="H"
                includeMargin={true}
              />
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="text-center mb-6">
          <p className="text-lg text-gray-600 mb-2">QR Code refreshes in:</p>
          <p className="text-5xl font-bold text-blue-600 font-mono">
            {formatCountdown(countdown)}
          </p>
        </div>

        <div className="border-t-2 border-gray-200 my-6"></div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 gap-6 text-center">
          <div className="bg-green-50 p-6 rounded-xl">
            <div className="text-green-600 text-4xl mb-2">✓</div>
            <p className="text-sm text-gray-600 mb-1">Today's Check-ins</p>
            <p className="text-3xl font-bold text-green-700">{checkInCount}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="text-blue-600 text-4xl mb-2">⏰</div>
            <p className="text-sm text-gray-600 mb-1">Active Since</p>
            <p className="text-3xl font-bold text-blue-700">{getCurrentTime()}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Scan the QR code with the attendance app to check in
          </p>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-refreshing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRDisplay;
