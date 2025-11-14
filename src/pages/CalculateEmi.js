import React, { useState, useEffect } from 'react';
import { fetchSalaryConfig } from '../services/salaryConfigApi';

const CalculateEmi = () => {
  // State
  const [basicSalary, setBasicSalary] = useState(0);
  const [hra, setHra] = useState(0);
  const [conveyance, setConveyance] = useState(1600);
  const [attendanceDays, setAttendanceDays] = useState(26);
  const [totalDays, setTotalDays] = useState(26);
  const [config, setConfig] = useState(null);

  // Fetch salary config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchSalaryConfig();
        setConfig(data);
      } catch (error) {
        console.error('Error loading salary config:', error);
      }
    };
    loadConfig();
  }, []);

  // Calculate CTC (Cost to Company)
  const calculateEMI = () => {
    const gross = basicSalary + hra + conveyance;
    
    // PF Employer Contribution (if applicable)
    const pfEmployerContribution = config?.pfEmployer 
      ? (basicSalary * config.pfEmployer / 100) 
      : 0;
    
    // ESI Employer Contribution (if applicable)
    const esiEmployerContribution = config?.esiEmployer 
      ? (gross * config.esiEmployer / 100) 
      : 0;
    
    const ctc = gross + pfEmployerContribution + esiEmployerContribution;
    return ctc;
  };

  // Calculate Net Payable (Take-home salary)
  const calculateNetPay = () => {
    const gross = basicSalary + hra + conveyance;
    
    // Pro-rata calculation based on attendance
    const proRataGross = (gross / totalDays) * attendanceDays;
    
    // PF Employee Contribution (12% of basic)
    const pfEmployeeContribution = config?.pfEmployee 
      ? (basicSalary * config.pfEmployee / 100) 
      : 0;
    
    // ESI Employee Contribution (0.75% of gross, if applicable)
    const esiEmployeeContribution = config?.esiEmployee 
      ? (gross * config.esiEmployee / 100) 
      : 0;
    
    // Professional Tax (fixed or percentage)
    const professionalTax = config?.professionalTax || 200;
    
    const netPayable = proRataGross - pfEmployeeContribution - esiEmployeeContribution - professionalTax;
    return Math.max(0, netPayable); // Ensure non-negative
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💰 Salary Calculator
        </h1>
        <p className="text-gray-600">
          Calculate CTC and Net Payable based on attendance and deductions
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Basic Salary (₹)
            </label>
            <input
              type="number"
              value={basicSalary}
              onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter basic salary"
            />
          </div>

          {/* HRA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HRA (₹)
            </label>
            <input
              type="number"
              value={hra}
              onChange={(e) => setHra(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter HRA"
            />
          </div>

          {/* Conveyance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conveyance Allowance (₹)
            </label>
            <input
              type="number"
              value={conveyance}
              onChange={(e) => setConveyance(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1600"
            />
          </div>

          {/* Attendance Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendance Days
            </label>
            <input
              type="number"
              value={attendanceDays}
              onChange={(e) => setAttendanceDays(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="26"
            />
          </div>

          {/* Total Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Days in Month
            </label>
            <input
              type="number"
              value={totalDays}
              onChange={(e) => setTotalDays(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="26"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CTC Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Cost to Company (CTC)</p>
            <p className="text-3xl font-bold text-blue-600">
              ₹{calculateEMI().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Includes employer contributions
            </p>
          </div>

          {/* Net Payable Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-1">Net Payable (Take-home)</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{calculateNetPay().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              After deductions ({attendanceDays}/{totalDays} days)
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Breakdown:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Gross Salary:</div>
            <div className="text-right font-medium">
              ₹{(basicSalary + hra + conveyance).toLocaleString('en-IN')}
            </div>
            
            <div>PF (Employee {config?.pfEmployee || 12}%):</div>
            <div className="text-right font-medium text-red-600">
              -₹{((basicSalary * (config?.pfEmployee || 12) / 100)).toLocaleString('en-IN')}
            </div>
            
            {config?.esiEmployee && (
              <>
                <div>ESI (Employee {config.esiEmployee}%):</div>
                <div className="text-right font-medium text-red-600">
                  -₹{((basicSalary + hra + conveyance) * config.esiEmployee / 100).toLocaleString('en-IN')}
                </div>
              </>
            )}
            
            <div>Professional Tax:</div>
            <div className="text-right font-medium text-red-600">
              -₹{(config?.professionalTax || 200).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculateEmi;