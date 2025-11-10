/**
 * Attendance API Service
 * 
 * Handles all API calls related to attendance management
 * using the centralized apiClient
 */

import apiClient from './apiClient';

/**
 * Get today's attendance records
 * 
 * @param {string} branch - Filter by branch (optional)
 * @param {string} status - Filter by status: PENDING, APPROVED, REJECTED (optional)
 * @returns {Promise<Object>} Response with attendance records
 * 
 * @example
 * // Get all today's attendance
 * const data = await getTodayAttendance();
 * 
 * @example
 * // Get pending attendance for Jaipur branch
 * const data = await getTodayAttendance('JAIPUR', 'PENDING');
 */
export const getTodayAttendance = async (branch = '', status = '') => {
  try {
    const params = new URLSearchParams();
    if (branch) params.append('branch', branch);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const url = queryString ? `/attendance/today?${queryString}` : '/attendance/today';
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    throw error;
  }
};

/**
 * Approve attendance record
 * 
 * @param {string} attendanceId - Attendance record ID to approve
 * @param {string} approvedBy - User ID of the approver (manager/admin)
 * @returns {Promise<Object>} Response with updated attendance record
 * 
 * @example
 * const result = await approveAttendance('673123...', '671234...');
 */
export const approveAttendance = async (attendanceId, approvedBy) => {
  try {
    const response = await apiClient.put(`/attendance/approve/${attendanceId}`, {
      approvedBy
    });
    return response.data;
  } catch (error) {
    console.error('Error approving attendance:', error);
    throw error;
  }
};

/**
 * Reject attendance record
 * 
 * @param {string} attendanceId - Attendance record ID to reject
 * @param {string} approvedBy - User ID of the approver (manager/admin)
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<Object>} Response with updated attendance record
 * 
 * @example
 * const result = await rejectAttendance('673123...', '671234...', 'Invalid location');
 */
export const rejectAttendance = async (attendanceId, approvedBy, rejectionReason) => {
  try {
    const response = await apiClient.put(`/attendance/reject/${attendanceId}`, {
      approvedBy,
      rejectionReason
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting attendance:', error);
    throw error;
  }
};

/**
 * Get monthly attendance summary for an employee
 * 
 * @param {string} employeeId - Employee ID
 * @param {string} month - Month name (e.g., "October")
 * @param {number} year - Year (e.g., 2025)
 * @returns {Promise<Object>} Response with monthly attendance summary
 * 
 * @example
 * const summary = await getMonthlyAttendance('673123...', 'October', 2025);
 */
export const getMonthlyAttendance = async (employeeId, month, year) => {
  try {
    const params = new URLSearchParams({
      employeeId,
      month,
      year: year.toString()
    });
    
    const response = await apiClient.get(`/attendance/monthly?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly attendance:', error);
    throw error;
  }
};
