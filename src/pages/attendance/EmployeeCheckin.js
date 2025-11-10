import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const EmployeeCheckin = () => {
  const [searchParams] = useSearchParams();
  const [employeeId, setEmployeeId] = useState('');
  const [qrData, setQrData] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoStatus, setAutoStatus] = useState('');

  // On mount: Get QR data from URL
  useEffect(() => {
    const qrParam = searchParams.get('qr');
    
    if (qrParam) {
      try {
        const decoded = decodeURIComponent(qrParam);
        const parsedQR = JSON.parse(decoded);
        setQrData(parsedQR);
        console.log('QR Data loaded:', parsedQR);
      } catch (error) {
        console.error('Invalid QR parameter:', error);
        setStatus({ type: 'error', message: 'Invalid QR code. Please scan again.' });
      }
    } else {
      setStatus({ type: 'error', message: 'No QR code detected. Please scan QR code at entrance.' });
    }
    
    calculateAutoStatus();
  }, [searchParams]);

  const calculateAutoStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    
    if (timeInMinutes < 10 * 60) { // Before 10:00 AM
      setAutoStatus('ON TIME ✓');
    } else if (timeInMinutes < 11 * 60) { // 10:00-11:00 AM
      setAutoStatus('LATE ⚠️');
    } else if (timeInMinutes < 14 * 60) { // 11:00-2:00 PM
      setAutoStatus('HALF DAY ⚠️');
    } else { // After 2:00 PM
      setAutoStatus('ABSENT ✗');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!employeeId || employeeId.trim() === '') {
      setStatus({ type: 'error', message: 'Please enter your Employee ID' });
      return;
    }

    if (!qrData) {
      setStatus({ type: 'error', message: 'QR code not loaded. Please scan again.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      console.log('Validating QR...');
      
      const validation = await apiClient.post('/attendance/qr/validate', {
        qrData: qrData
      });

      if (!validation.data.valid) {
        setStatus({ 
          type: 'error', 
          message: validation.data.reason || 'QR code expired. Please scan new code.'
        });
        setLoading(false);
        return;
      }

      console.log('Marking attendance...');

      const response = await apiClient.post('/attendance/checkin', {
        employeeId: employeeId.trim(),
        qrCodeId: qrData.qrCodeId,
        branchId: qrData.branchId
      });

      console.log('Success:', response.data);

      setStatus({ 
        type: 'success', 
        message: `✓ Attendance Marked!\n\nEmployee: ${employeeId}\nTime: ${new Date().toLocaleTimeString()}\nStatus: ${response.data.attendance.autoStatus}\n\n⏳ Waiting for manager approval...`
      });

      setTimeout(() => {
        setEmployeeId('');
        setStatus(null);
      }, 5000);

    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to mark attendance';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📍 Mark Attendance
          </h1>
          <p className="text-gray-600">Jaipur Office</p>
        </div>

        {/* QR Status */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">QR Code:</span>
            <span className={`text-sm font-bold ${qrData ? 'text-green-600' : 'text-red-600'}`}>
              {qrData ? '✓ Valid' : '✗ Invalid'}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Time:</span>
            <span className="text-sm font-bold text-gray-800">{currentTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className="text-sm font-bold text-blue-600">{autoStatus}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enter Your Employee ID:
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="EMP123"
              disabled={loading || !qrData}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !qrData}
            className={`w-full py-4 text-lg font-bold rounded-lg transition-all ${
              loading || !qrData
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {loading ? 'SUBMITTING...' : 'MARK ATTENDANCE'}
          </button>
        </form>

        {/* Status Message */}
        {status && (
          <div className={`mt-6 p-4 rounded-lg ${
            status.type === 'success' 
              ? 'bg-green-50 border-2 border-green-500' 
              : 'bg-red-50 border-2 border-red-500'
          }`}>
            <p className={`text-sm font-medium whitespace-pre-line ${
              status.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {status.message}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeCheckin;