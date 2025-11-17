import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText } from 'lucide-react';

const ApprovedSalaries = () => {
    const [month, setMonth] = useState('November');
    const [year, setYear] = useState('2025');
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    useEffect(() => {
        fetchApprovedSalaries();
    }, [month, year]);

    const fetchApprovedSalaries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get('http://localhost:5000/api/salary-approval/approved', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { month, year }
            });

            setSalaries(response.data.salaries);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching approved salaries:', error);
            setLoading(false);
        }
    };

    const handleDownloadSlip = async (salaryId, employeeName) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:5000/api/salary-slips/generate/${salaryId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate salary slip');
            }

            // Create blob from response
            const blob = await response.blob();

            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `SalarySlip_${employeeName.replace(' ', '_')}_November_2025.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Error downloading salary slip:', error);
            alert('Failed to download salary slip');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Approved Salaries</h1>
                    <p className="text-gray-600 mt-2">View and download salary slips</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Month
                            </label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {months.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year
                            </label>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Count */}
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                    <div className="flex items-center">
                        <FileText className="w-5 h-5 text-green-600 mr-3" />
                        <p className="text-green-800">
                            <strong>{salaries.length}</strong> approved salaries for {month} {year}
                        </p>
                    </div>
                </div>

                {/* Salaries Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : salaries.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500 text-lg">No approved salaries for this period</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {salaries.map((salary) => (
                                        <tr key={salary._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {salary.employeeId?.firstName} {salary.employeeId?.lastName}
                                                <div className="text-xs text-gray-500">{salary.employeeId?.eId}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {salary.attendanceDays}/{salary.totalDays} days
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                ₹{salary.ctc?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-green-600">
                                                ₹{salary.netPayable?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {salary.approvedBy?.firstName} {salary.approvedBy?.lastName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {salary.approvedAt ? new Date(salary.approvedAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDownloadSlip(salary._id, `${salary.employeeId?.firstName} ${salary.employeeId?.lastName}`)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download Slip
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovedSalaries;