import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '../../services/apiClient';

const QRDisplay = () => {
  // State management
  const [qrData, setQrData] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [error, setError] = useState(null);
  const branchId = "JAIPUR";

  /**
   * Fetch QR code data from API
   * Called on mount and every 4 minutes for auto-refresh
   */
  const fetchQR = async () => {
    try {
      console.log('Fetching QR code for branch:', branchId);

      // Call API to get active QR code
      const response = await apiClient.get(`/attendance/qr/active?branchId=${branchId}`);

      // Extract QR data from response
      const qrDataFromApi = response.data.qrData || response.data;

      console.log('QR code received:', qrDataFromApi);

      // Update state with new QR data
      setQrData(qrDataFromApi);

      // Reset countdown to 5 minutes
      setCountdown(300);

      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error('Error fetching QR code:', err);
      setError('Failed to load QR code. Please try again.');
    }
  };

  /**
   * Effect: Fetch QR code when component mounts
   */
  useEffect(() => {
    fetchQR();
  }, []);

  /**
   * Effect: Auto-refresh QR code every 4 minutes (240 seconds)
   * This ensures QR never expires (5 min expiry, 4 min refresh)
   */
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing QR code...');
      fetchQR();
    }, 240000); // 4 minutes in milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  /**
   * Effect: Countdown timer - decrements every second
   */
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000); // Update every second

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, [countdown]);

  /**
   * Format countdown seconds to MM:SS format
   * Example: 300 seconds -> "5:00", 65 seconds -> "1:05"
   */
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Get current date formatted as "Friday, November 08, 2025"
   */
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  /**
   * Get current time formatted as "10:30 AM"
   */
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Error state - show error message with retry button
  if (error && !qrData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Error Loading QR Code</h2>
          <p className="text-gray-600 mb-6 text-lg">{error}</p>
          <button
            onClick={fetchQR}
            className="px-8 py-4 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state - show spinner while fetching initial QR
  if (!qrData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-2xl font-semibold text-gray-700">Loading QR Code...</p>
        </div>
      </div>
    );
  }

  // Main display
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            {branchId} OFFICE
          </h1>
          <h2 className="text-3xl font-semibold text-blue-600 mb-4">
            Attendance Check-In
          </h2>
          <p className="text-xl text-gray-600">
            {currentDate}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300 mb-12"></div>

        {/* QR Code Section - Centered */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-blue-500">
            <QRCodeSVG
              value={JSON.stringify(qrData)}
              size={500}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="text-center mb-12">
          <p className="text-2xl text-gray-600 mb-3">QR Code expires in:</p>
          <p className="text-7xl font-bold text-blue-600 font-mono">
            {formatTime(countdown)}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300 mb-12"></div>

        {/* Footer Section - Statistics */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Today's Check-ins */}
          <div className="bg-gray-50 p-8 rounded-xl text-center border-2 border-gray-200">
            <div className="text-green-600 text-5xl mb-3">✓</div>
            <p className="text-lg text-gray-600 mb-2">Today's Check-ins</p>
            <p className="text-5xl font-bold text-gray-900">0</p>
          </div>

          {/* Current Time */}
          <div className="bg-gray-50 p-8 rounded-xl text-center border-2 border-gray-200">
            <div className="text-blue-600 text-5xl mb-3">🕐</div>
            <p className="text-lg text-gray-600 mb-2">Current Time</p>
            <p className="text-5xl font-bold text-gray-900">{currentTime}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-xl text-gray-500">
            Scan the QR code with your mobile app to check in
          </p>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-400 text-sm">Auto-refreshing every 4 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRDisplay;
