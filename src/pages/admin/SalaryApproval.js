import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Download } from 'lucide-react'; // 👈 Add Download

const SalaryApproval = () => {
    const [month, setMonth] = useState('November');
    const [year, setYear] = useState('2025');
    const [pendingSalaries, setPendingSalaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSalaries, setSelectedSalaries] = useState([]);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    useEffect(() => {
        fetchPendingSalaries();
    }, [month, year]);

    const fetchPendingSalaries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get('http://localhost:5000/api/salary-approval/pending', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { month, year }
            });

            setPendingSalaries(response.data.salaries);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching pending salaries:', error);
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedSalaries(pendingSalaries.map(s => s._id));
        } else {
            setSelectedSalaries([]);
        }
    };

    const handleSelectSalary = (id) => {
        if (selectedSalaries.includes(id)) {
            setSelectedSalaries(selectedSalaries.filter(s => s !== id));
        } else {
            setSelectedSalaries([...selectedSalaries, id]);
        }
    };

    const handleApproveSingle = async (id) => {
        if (!window.confirm('Approve this salary?')) return;

        try {
            const token = localStorage.getItem('token');

            await axios.post(
                `http://localhost:5000/api/salary-approval/approve/${id}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            alert('Salary approved successfully!');
            fetchPendingSalaries();
        } catch (error) {
            console.error('Error approving salary:', error);
            alert('Failed to approve salary');
        }
    };

    const handleBulkApprove = async () => {
        if (selectedSalaries.length === 0) {
            alert('Please select salaries to approve');
            return;
        }

        if (!window.confirm(`Approve ${selectedSalaries.length} salaries?`)) return;

        try {
            const token = localStorage.getItem('token');

            await axios.post(
                'http://localhost:5000/api/salary-approval/bulk-approve',
                { salaryIds: selectedSalaries },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            alert(`${selectedSalaries.length} salaries approved successfully!`);
            setSelectedSalaries([]);
            fetchPendingSalaries();
        } catch (error) {
            console.error('Error in bulk approval:', error);
            alert('Failed to approve salaries');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject and delete this salary? This cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');

            await axios.post(
                `http://localhost:5000/api/salary-approval/reject/${id}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            alert('Salary rejected and deleted');
            fetchPendingSalaries();
        } catch (error) {
            console.error('Error rejecting salary:', error);
            alert('Failed to reject salary');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Salary Approval</h1>
                    <p className="text-gray-600 mt-2">Review and approve pending salaries</p>
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

                        <button
                            onClick={handleBulkApprove}
                            disabled={selectedSalaries.length === 0}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            Approve Selected ({selectedSalaries.length})
                        </button>
                    </div>
                </div>

                {/* Pending Count */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex items-center">
                        <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                        <p className="text-yellow-800">
                            <strong>{pendingSalaries.length}</strong> salaries pending approval for {month} {year}
                        </p>
                    </div>
                </div>

                {/* Salaries Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : pendingSalaries.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500 text-lg">No pending salaries for this period</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedSalaries.length === pendingSalaries.length}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pendingSalaries.map((salary) => (
                                        <tr key={salary._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSalaries.includes(salary._id)}
                                                    onChange={() => handleSelectSalary(salary._id)}
                                                    className="w-4 h-4"
                                                />
                                            </td>
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
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                                    {salary.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {salary.status === 'APPROVED' ? (

                                                        <a href={`http://localhost:5000/api/salary-slips/generate/${salary._id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                            title="Download Slip"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </a>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveSingle(salary._id)}
                                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(salary._id)}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
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

export default SalaryApproval;