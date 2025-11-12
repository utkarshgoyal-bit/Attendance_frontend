import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, DollarSign, TrendingUp } from 'lucide-react';
import Sidebar from './Sidebar';
import apiClient from '../../services/apiClient';
import Toast from '../../components/Toast';

const SalaryProcessing = () => {
  const [month, setMonth] = useState('November');
  const [year, setYear] = useState('2025');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [toast, setToast] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleProcess = async () => {
    if (!window.confirm(`Process salaries for all employees for ${month} ${year}? This will auto-calculate based on attendance.`)) {
      return;
    }

    setProcessing(true);
    setResults([]);

    try {
      // Get all employees
      const empRes = await apiClient.get('/employees');
      const employees = empRes.data;

      if (!employees || employees.length === 0) {
        showToast('No employees found', 'error');
        setProcessing(false);
        return;
      }

      showToast(`Processing salaries for ${employees.length} employees...`, 'success');

      // Process each employee
      let successCount = 0;
      let failCount = 0;

      for (let emp of employees) {
        try {
          const res = await apiClient.post('/salaries/calculate-from-attendance', {
            employeeId: emp._id,
            month,
            year: parseInt(year)
          });

          setResults(prev => [...prev, {
            name: `${emp.firstName} ${emp.lastName}`,
            eId: emp.eId,
            status: 'Success',
            payable: res.data.summary.payableDays,
            totalDays: res.data.summary.totalDays,
            presentDays: res.data.summary.presentDays,
            deductions: res.data.summary.totalDeductions,
            grossSalary: res.data.summary.grossSalary,
            netSalary: res.data.summary.netPayable
          }]);

          successCount++;
        } catch (error) {
          setResults(prev => [...prev, {
            name: `${emp.firstName} ${emp.lastName}`,
            eId: emp.eId,
            status: 'Failed',
            error: error.response?.data?.message || 'Processing error'
          }]);

          failCount++;
        }
      }

      if (failCount === 0) {
        showToast(`✓ Successfully processed ${successCount} salaries!`, 'success');
      } else {
        showToast(`Completed: ${successCount} success, ${failCount} failed`, 'error');
      }

    } catch (error) {
      console.error('Error processing salaries:', error);
      showToast('Failed to fetch employees', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotals = () => {
    const successful = results.filter(r => r.status === 'Success');
    return {
      count: successful.length,
      totalGross: successful.reduce((sum, r) => sum + (r.grossSalary || 0), 0),
      totalNet: successful.reduce((sum, r) => sum + (r.netSalary || 0), 0),
      totalPayableDays: successful.reduce((sum, r) => sum + (r.payable || 0), 0)
    };
  };

  const totals = results.length > 0 ? calculateTotals() : null;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="bg-white h-20 flex items-center justify-start px-6 m-4 rounded-lg shadow-lg">
          <Link
            to="/admin"
            className="bg-gray-300 text-black py-2 px-2 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 mr-4"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-bold text-black">
            💰 Process Monthly Salaries
          </h1>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          {/* Selection Panel */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Period</h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={processing}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                >
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={processing}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                />
              </div>

              <button
                onClick={handleProcess}
                disabled={processing}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    <span>Process All Salaries</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This will automatically calculate salaries for all employees based on their approved attendance for {month} {year}. Deductions will be applied according to organization configuration.
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          {totals && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processed</p>
                    <p className="text-3xl font-bold text-blue-600">{totals.count}</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Payable Days</p>
                    <p className="text-3xl font-bold text-green-600">{totals.totalPayableDays}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Gross Salary</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{totals.totalGross.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Net Payable</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{totals.totalNet.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-lg">
                  Processing Results ({results.length} employees)
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Payable Days</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{r.eId}</td>
                        <td className="px-4 py-3 text-center">
                          {r.status === 'Success' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ✗ Failed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {r.status === 'Success' ? (
                            <span className="text-sm font-medium">
                              {r.payable}/{r.totalDays}
                              {r.deductions > 0 && (
                                <span className="text-xs text-red-600 ml-1">
                                  (-{r.deductions})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          {r.grossSalary ? `₹${r.grossSalary.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                          {r.netSalary ? `₹${r.netSalary.toLocaleString('en-IN')}` : (
                            <span className="text-red-600 text-xs">{r.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!processing && results.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Ready to Process Salaries
              </h3>
              <p className="text-gray-500">
                Select a month and year, then click "Process All Salaries" to begin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={4000}
        />
      )}
    </div>
  );
};

export default SalaryProcessing;
