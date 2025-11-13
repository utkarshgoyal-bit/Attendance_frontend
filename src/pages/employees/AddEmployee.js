import React, { useState } from 'react';
import apiClient from '../../services/apiClient';

const AddEmployee = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    eId: '', branchId: '', department: '', designation: '',
    managerId: '', joiningDate: '',
    base: 0, hra: 0, conveyance: 1600,
    hasAccount: false, password: '', role: 'EMPLOYEE'
  });

  const handleSubmit = async () => {
    try {
      await apiClient.post('/employees', data);
      alert('Employee created!');
      window.location.href = '/employees';
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Employee - Step {step}/4</h1>

      {step === 1 && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="font-semibold">Personal Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="First Name" value={data.firstName} onChange={(e) => setData({...data, firstName: e.target.value})} className="border rounded px-3 py-2" />
            <input placeholder="Last Name" value={data.lastName} onChange={(e) => setData({...data, lastName: e.target.value})} className="border rounded px-3 py-2" />
            <input placeholder="Email" value={data.email} onChange={(e) => setData({...data, email: e.target.value})} className="border rounded px-3 py-2" />
            <input placeholder="Phone" value={data.phone} onChange={(e) => setData({...data, phone: e.target.value})} className="border rounded px-3 py-2" />
          </div>
          <button onClick={() => setStep(2)} className="bg-blue-600 text-white px-6 py-2 rounded">Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="font-semibold">Employment</h2>
          <input placeholder="Employee ID (EMP001)" value={data.eId} onChange={(e) => setData({...data, eId: e.target.value})} className="border rounded px-3 py-2 w-full" />
          <input placeholder="Department" value={data.department} onChange={(e) => setData({...data, department: e.target.value})} className="border rounded px-3 py-2 w-full" />
          <input placeholder="Designation" value={data.designation} onChange={(e) => setData({...data, designation: e.target.value})} className="border rounded px-3 py-2 w-full" />
          <input type="date" value={data.joiningDate} onChange={(e) => setData({...data, joiningDate: e.target.value})} className="border rounded px-3 py-2 w-full" />
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="border px-6 py-2 rounded">Back</button>
            <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-6 py-2 rounded">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="font-semibold">Salary</h2>
          <input type="number" placeholder="Basic Salary" value={data.base} onChange={(e) => setData({...data, base: parseInt(e.target.value)})} className="border rounded px-3 py-2 w-full" />
          <input type="number" placeholder="HRA" value={data.hra} onChange={(e) => setData({...data, hra: parseInt(e.target.value)})} className="border rounded px-3 py-2 w-full" />
          <input type="number" placeholder="Conveyance" value={data.conveyance} onChange={(e) => setData({...data, conveyance: parseInt(e.target.value)})} className="border rounded px-3 py-2 w-full" />
          <p>Gross: ₹{data.base + data.hra + data.conveyance}/month</p>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="border px-6 py-2 rounded">Back</button>
            <button onClick={() => setStep(4)} className="bg-blue-600 text-white px-6 py-2 rounded">Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="font-semibold">System Access</h2>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={data.hasAccount} onChange={(e) => setData({...data, hasAccount: e.target.checked})} />
            Create system account
          </label>
          {data.hasAccount && (
            <>
              <select value={data.role} onChange={(e) => setData({...data, role: e.target.value})} className="border rounded px-3 py-2 w-full">
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR_ADMIN">HR Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <input type="password" placeholder="Password" value={data.password} onChange={(e) => setData({...data, password: e.target.value})} className="border rounded px-3 py-2 w-full" />
            </>
          )}
          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="border px-6 py-2 rounded">Back</button>
            <button onClick={handleSubmit} className="bg-green-600 text-white px-6 py-2 rounded">Create</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployee;
