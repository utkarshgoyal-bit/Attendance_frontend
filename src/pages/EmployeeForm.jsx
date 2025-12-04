import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { Card, CardHeader, CardContent, Button, Input, Select, useToast } from '../components/ui';
import { Save, ArrowLeft } from 'lucide-react';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [managers, setManagers] = useState([]);
  
  const [form, setForm] = useState({
    eId: '',
    personal: { firstName: '', lastName: '', email: '', phone: '', dob: '', gender: '', bloodGroup: '', maritalStatus: '', currentAddress: '', permanentAddress: '', emergencyContact: { name: '', relation: '', phone: '' } },
    professional: { department: '', designation: '', joiningDate: '', probationPeriod: 3, noticePeriod: 30, reportingManager: '', branch: '', shift: '', employeeType: 'Full-time', status: 'Probation' },
    bank: { bankName: '', accountNumber: '', ifsc: '', pan: '', aadhar: '' },
    createUser: true,
    role: 'EMPLOYEE',
    password: '',
  });

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) fetchEmployee();
  }, [id]);

  const fetchDropdowns = async () => {
    try {
      const [depts, brnchs, shfts, emps] = await Promise.all([
        api.get('/settings/departments'),
        api.get('/settings/branches'),
        api.get('/settings/shifts'),
        api.get('/employees?limit=100'),
      ]);
      setDepartments(depts.data);
      setBranches(brnchs.data);
      setShifts(shfts.data);
      setManagers(emps.data.employees);
    } catch {}
  };

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      const emp = res.data;
      setForm({
        eId: emp.eId,
        personal: { ...emp.personal, dob: emp.personal.dob?.split('T')[0] || '', emergencyContact: emp.personal.emergencyContact || { name: '', relation: '', phone: '' } },
        professional: { ...emp.professional, department: emp.professional.department?._id || '', branch: emp.professional.branch?._id || '', shift: emp.professional.shift?._id || '', reportingManager: emp.professional.reportingManager?._id || '', joiningDate: emp.professional.joiningDate?.split('T')[0] || '' },
        bank: emp.bank || {},
        createUser: false,
        role: 'EMPLOYEE',
        password: '',
      });
    } catch (err) {
      showError('Failed to load employee');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, form);
        success('Employee updated');
      } else {
        await api.post('/employees', form);
        success('Employee created');
      }
      navigate('/employees');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (section, field, value) => {
    if (section) {
      setForm(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const updateNested = (section, parent, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [parent]: { ...prev[section][parent], [field]: value } }
    }));
  };

  const GENDER = [{ value: '', label: 'Select' }, { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }];
  const BLOOD = [{ value: '', label: 'Select' }, 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => typeof b === 'string' ? { value: b, label: b } : b);
  const MARITAL = [{ value: '', label: 'Select' }, { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }];
  const EMP_TYPE = [{ value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' }, { value: 'Contract', label: 'Contract' }, { value: 'Intern', label: 'Intern' }];
  const STATUS = [{ value: 'Probation', label: 'Probation' }, { value: 'Active', label: 'Active' }, { value: 'Confirmed', label: 'Confirmed' }];
  const ROLES = [{ value: 'EMPLOYEE', label: 'Employee' }, { value: 'MANAGER', label: 'Manager' }, { value: 'HR_ADMIN', label: 'HR Admin' }];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/employees')}><ArrowLeft size={20} /></Button>
        <h2 className="text-2xl font-bold">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <Card>
          <CardHeader><h3 className="font-semibold">Personal Details</h3></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name *" value={form.personal.firstName} onChange={e => updateForm('personal', 'firstName', e.target.value)} required />
            <Input label="Last Name *" value={form.personal.lastName} onChange={e => updateForm('personal', 'lastName', e.target.value)} required />
            <Input label="Email *" type="email" value={form.personal.email} onChange={e => updateForm('personal', 'email', e.target.value)} required />
            <Input label="Phone *" value={form.personal.phone} onChange={e => updateForm('personal', 'phone', e.target.value)} required />
            <Input label="Date of Birth" type="date" value={form.personal.dob} onChange={e => updateForm('personal', 'dob', e.target.value)} />
            <Select label="Gender" options={GENDER} value={form.personal.gender} onChange={e => updateForm('personal', 'gender', e.target.value)} />
            <Select label="Blood Group" options={BLOOD} value={form.personal.bloodGroup} onChange={e => updateForm('personal', 'bloodGroup', e.target.value)} />
            <Select label="Marital Status" options={MARITAL} value={form.personal.maritalStatus} onChange={e => updateForm('personal', 'maritalStatus', e.target.value)} />
            <div className="md:col-span-2">
              <Input label="Current Address" value={form.personal.currentAddress} onChange={e => updateForm('personal', 'currentAddress', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader><h3 className="font-semibold">Emergency Contact</h3></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Name" value={form.personal.emergencyContact.name} onChange={e => updateNested('personal', 'emergencyContact', 'name', e.target.value)} />
            <Input label="Relation" value={form.personal.emergencyContact.relation} onChange={e => updateNested('personal', 'emergencyContact', 'relation', e.target.value)} />
            <Input label="Phone" value={form.personal.emergencyContact.phone} onChange={e => updateNested('personal', 'emergencyContact', 'phone', e.target.value)} />
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader><h3 className="font-semibold">Professional Details</h3></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isEdit && <Input label="Employee ID" value={form.eId} onChange={e => updateForm(null, 'eId', e.target.value)} placeholder="Auto-generated if empty" />}
            <Select label="Department" options={[{ value: '', label: 'Select' }, ...departments.map(d => ({ value: d._id, label: d.name }))]} value={form.professional.department} onChange={e => updateForm('professional', 'department', e.target.value)} />
            <Input label="Designation" value={form.professional.designation} onChange={e => updateForm('professional', 'designation', e.target.value)} />
            <Input label="Joining Date *" type="date" value={form.professional.joiningDate} onChange={e => updateForm('professional', 'joiningDate', e.target.value)} required />
            <Select label="Employee Type" options={EMP_TYPE} value={form.professional.employeeType} onChange={e => updateForm('professional', 'employeeType', e.target.value)} />
            <Select label="Status" options={STATUS} value={form.professional.status} onChange={e => updateForm('professional', 'status', e.target.value)} />
            <Select label="Branch" options={[{ value: '', label: 'Select' }, ...branches.map(b => ({ value: b._id, label: b.name }))]} value={form.professional.branch} onChange={e => updateForm('professional', 'branch', e.target.value)} />
            <Select label="Shift" options={[{ value: '', label: 'Select' }, ...shifts.map(s => ({ value: s._id, label: s.name }))]} value={form.professional.shift} onChange={e => updateForm('professional', 'shift', e.target.value)} />
            <Select label="Reporting Manager" options={[{ value: '', label: 'Select' }, ...managers.filter(m => m._id !== id).map(m => ({ value: m._id, label: `${m.personal.firstName} ${m.personal.lastName} (${m.eId})` }))]} value={form.professional.reportingManager} onChange={e => updateForm('professional', 'reportingManager', e.target.value)} />
            <Input label="Probation (months)" type="number" value={form.professional.probationPeriod} onChange={e => updateForm('professional', 'probationPeriod', e.target.value)} />
            <Input label="Notice Period (days)" type="number" value={form.professional.noticePeriod} onChange={e => updateForm('professional', 'noticePeriod', e.target.value)} />
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader><h3 className="font-semibold">Bank & Statutory</h3></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Bank Name" value={form.bank.bankName} onChange={e => updateForm('bank', 'bankName', e.target.value)} />
            <Input label="Account Number" value={form.bank.accountNumber} onChange={e => updateForm('bank', 'accountNumber', e.target.value)} />
            <Input label="IFSC Code" value={form.bank.ifsc} onChange={e => updateForm('bank', 'ifsc', e.target.value)} />
            <Input label="PAN Number" value={form.bank.pan} onChange={e => updateForm('bank', 'pan', e.target.value)} />
            <Input label="Aadhar Number" value={form.bank.aadhar} onChange={e => updateForm('bank', 'aadhar', e.target.value)} />
          </CardContent>
        </Card>

        {/* User Account */}
        {!isEdit && (
          <Card>
            <CardHeader><h3 className="font-semibold">User Account</h3></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.createUser} onChange={e => updateForm(null, 'createUser', e.target.checked)} className="rounded" />
                Create login account for this employee
              </label>
              {form.createUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Role" options={ROLES} value={form.role} onChange={e => updateForm(null, 'role', e.target.value)} />
                  <Input label="Password" type="password" value={form.password} onChange={e => updateForm(null, 'password', e.target.value)} placeholder="Default: Welcome@123" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button type="submit" loading={loading}><Save size={18} className="mr-2" /> {isEdit ? 'Update' : 'Create'} Employee</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/employees')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
