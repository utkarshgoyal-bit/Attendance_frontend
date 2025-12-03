import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Card, Button, Input, Select, Toast } from '../../components/ui';
import { api } from '../../services/api';
import { Save } from 'lucide-react';

const AddEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eId: '',
    department: '',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    branchId: '',
    role: 'EMPLOYEE',
    salary: { base: '', hra: '', conveyance: '' }
  });

  const loadBranches = useCallback(async () => {
    try {
      const { data } = await api.getBranches();
      setBranches(data.branches || []);
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  }, []);

  const loadEmployee = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await api.getEmployee(id);
      const emp = data.employee || data;
      setFormData({
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        email: emp.email || '',
        phone: emp.phone || '',
        eId: emp.eId || '',
        department: emp.department || '',
        designation: emp.designation || '',
        joiningDate: emp.joiningDate?.split('T')[0] || '',
        branchId: emp.branchId?._id || emp.branchId || '',
        role: emp.role || 'EMPLOYEE',
        salary: {
          base: emp.salary?.base || emp.base || '',
          hra: emp.salary?.hra || emp.hra || '',
          conveyance: emp.salary?.conveyance || emp.conveyance || ''
        }
      });
    } catch (error) {
      setToast({ message: 'Failed to load employee', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBranches();
    if (isEdit) loadEmployee();
  }, [loadBranches, loadEmployee, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('salary.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        salary: { ...prev.salary, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        salary: {
          base: Number(formData.salary.base) || 0,
          hra: Number(formData.salary.hra) || 0,
          conveyance: Number(formData.salary.conveyance) || 0
        }
      };

      if (isEdit) {
        await api.updateEmployee(id, payload);
        setToast({ message: 'Employee updated successfully', type: 'success' });
      } else {
        await api.createEmployee(payload);
        setToast({ message: 'Employee created successfully', type: 'success' });
      }

      setTimeout(() => navigate('/employees'), 1500);
    } catch (error) {
      setToast({ 
        message: error.response?.data?.message || 'Failed to save employee', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={isEdit ? 'Edit Employee' : 'Add Employee'} backTo="/employees">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name *" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <Input label="Last Name *" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
              <Input label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
          </Card>

          {/* Employment Details */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
            <div className="space-y-4">
              <Input label="Employee ID *" name="eId" value={formData.eId} onChange={handleChange} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Department" name="department" value={formData.department} onChange={handleChange} />
                <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} />
              </div>
              <Input label="Joining Date" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} />
              <Select
                label="Branch"
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select Branch' },
                  ...branches.map(b => ({ value: b._id, label: `${b.name} (${b.code})` }))
                ]}
              />
              <Select
                label="Role *"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={[
                  { value: 'EMPLOYEE', label: 'Employee' },
                  { value: 'MANAGER', label: 'Manager' },
                  { value: 'HR_ADMIN', label: 'HR Admin' },
                  { value: 'SUPER_ADMIN', label: 'Super Admin' }
                ]}
              />
            </div>
          </Card>

          {/* Salary Information */}
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Salary Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Base Salary (₹)" name="salary.base" type="number" value={formData.salary.base} onChange={handleChange} />
              <Input label="HRA (₹)" name="salary.hra" type="number" value={formData.salary.hra} onChange={handleChange} />
              <Input label="Conveyance (₹)" name="salary.conveyance" type="number" value={formData.salary.conveyance} onChange={handleChange} />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              CTC: ₹{(Number(formData.salary.base) + Number(formData.salary.hra) + Number(formData.salary.conveyance)).toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate('/employees')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            <Save className="w-4 h-4" /> {isEdit ? 'Update' : 'Create'} Employee
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default AddEmployee;
