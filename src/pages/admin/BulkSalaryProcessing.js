import React, { useState } from 'react';
import axios from 'axios';
import { Calculator, CheckCircle, XCircle } from 'lucide-react';

const BulkSalaryProcessing = () => {
    const [month, setMonth] = useState('November');
    const [year, setYear] = useState('2025');
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    const handleCalculate = async () => {
        if (!window.confirm(`Calculate salaries for all employees for ${month} ${year}?`)) {
            return;
        }

        setProcessing(true);
        setResults(null);

        try {
            const token = localStorage.getItem('token');

            const response = await axios.post(
                'http://localhost:5000/api/salary-calculation/bulk-calculate',
                { month, year },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setResults(response.data);
            setProcessing(false);
        } catch (error) {
            console.error('Error in bulk calculation:', error);
            alert('Failed to process bulk calculation: ' + (error.response?.data?.message || error.message));
            setProcessing(false);
        }
    };
    const handleSaveAll = async () => {
        if (!window.confirm(`Save ${results.results.length} salaries to database?`)) {
            return;
        }

        setProcessing(true);

        try {
            const token = localStorage.getItem('token');

            const response = await axios.post(
                'http://localhost:5000/api/salary-calculation/bulk-save',
                {
                    month,
                    year,
                    salaries: results.results.map(r => ({
                        employeeId: r.employeeId,
                        employeeName: r.employeeName,
                        grossEarnings: r.grossEarnings,
                        totalDeductions: r.totalDeductions,
                        netSalary: r.netSalary,
                        attendance: r.attendance,
                        earnings: r.earnings,
                        deductions: r.deductions
                    }))
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            alert(`Successfully saved ${response.data.summary.saved} salaries!`);

            if (response.data.summary.failed > 0) {
                console.log('Failed entries:', response.data.errors);
                alert(`Warning: ${response.data.summary.failed} salaries failed to save. Check console for details.`);
            }

            setProcessing(false);
            setResults(null);

        } catch (error) {
            console.error('Error saving salaries:', error);
            alert('Failed to save salaries: ' + (error.response?.data?.message || error.message));
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Bulk Salary Processing</h1>
                    <p className="text-gray-600 mt-2">Calculate salaries for all employees at once</p>
                </div>

                {/* Controls */}
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

                        <button
                            onClick={handleCalculate}
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Calculator className="w-4 h-4" />
                            {processing ? 'Processing...' : 'Calculate All'}
                        </button>
                    </div>
                </div>

                {/* Processing Status */}
                {processing && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-lg">Processing salaries...</span>
                        </div>
                    </div>
                )}

                {/* Results Summary */}
                {results && (
                    <>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-3xl font-bold text-gray-900">{results.summary.total}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Employees</div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-3xl font-bold text-green-600">{results.summary.successful}</div>
                                <div className="text-sm text-gray-600 mt-1">Successful</div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-3xl font-bold text-red-600">{results.summary.failed}</div>
                                <div className="text-sm text-gray-600 mt-1">Failed</div>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold">Calculation Results</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {results.results.map((result, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {result.employeeName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {result.attendance.presentDays}/{result.attendance.totalDays} days
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    ₹{result.grossEarnings.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-red-600">
                                                    ₹{result.totalDeductions.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-green-600">
                                                    ₹{result.netSalary.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}

                                        {results.errors.map((error, index) => (
                                            <tr key={`error-${index}`} className="hover:bg-gray-50 bg-red-50">
                                                <td className="px-6 py-4">
                                                    <XCircle className="w-5 h-5 text-red-600" />
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900" colSpan="5">
                                                    Employee ID: {error.employeeId} - Error: {error.error}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setResults(null)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Clear Results
                            </button>
                            <button
                                onClick={handleSaveAll}
                                disabled={processing}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Approve & Save All'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BulkSalaryProcessing;