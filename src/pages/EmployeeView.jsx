import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Card, CardHeader, CardContent, Button, Badge, useToast } from '../components/ui';
import { ArrowLeft, Edit, Mail, Phone, Calendar, Building2, User, FileText } from 'lucide-react';

const EmployeeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      setEmployee(res.data);
    } catch (err) {
      showError('Failed to load employee');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!employee) return null;

  const { personal, professional, bank, documents } = employee;

  const statusColors = { Active: 'success', Probation: 'warning', Confirmed: 'success', 'Notice Period': 'warning', Inactive: 'default', Absconding: 'danger', Terminated: 'danger' };

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon size={18} className="text-gray-400 mt-0.5" />}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/employees')}><ArrowLeft size={20} /></Button>
          <h2 className="text-2xl font-bold">Employee Profile</h2>
        </div>
        <Link to={`/employees/${id}/edit`}>
          <Button><Edit size={18} className="mr-2" /> Edit</Button>
        </Link>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
              {personal.firstName?.[0]}{personal.lastName?.[0]}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{personal.firstName} {personal.lastName}</h3>
              <p className="text-gray-500">{professional.designation} • {employee.eId}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={statusColors[professional.status]}>{professional.status}</Badge>
                <Badge>{professional.employeeType}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{professional.department?.name || '-'}</p>
              <p className="text-sm text-gray-500 mt-2">Branch</p>
              <p className="font-medium">{professional.branch?.name || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader><h3 className="font-semibold">Personal Information</h3></CardHeader>
          <CardContent className="divide-y">
            <InfoRow icon={Mail} label="Email" value={personal.email} />
            <InfoRow icon={Phone} label="Phone" value={personal.phone} />
            <InfoRow icon={Calendar} label="Date of Birth" value={personal.dob ? new Date(personal.dob).toLocaleDateString() : '-'} />
            <InfoRow label="Gender" value={personal.gender} />
            <InfoRow label="Blood Group" value={personal.bloodGroup} />
            <InfoRow label="Marital Status" value={personal.maritalStatus} />
            <InfoRow label="Current Address" value={personal.currentAddress} />
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card>
          <CardHeader><h3 className="font-semibold">Professional Information</h3></CardHeader>
          <CardContent className="divide-y">
            <InfoRow icon={Calendar} label="Joining Date" value={new Date(professional.joiningDate).toLocaleDateString()} />
            <InfoRow icon={Building2} label="Shift" value={professional.shift?.name} />
            <InfoRow icon={User} label="Reporting Manager" value={professional.reportingManager ? `${professional.reportingManager.personal?.firstName} ${professional.reportingManager.personal?.lastName}` : '-'} />
            <InfoRow label="Probation Period" value={`${professional.probationPeriod} months`} />
            <InfoRow label="Notice Period" value={`${professional.noticePeriod} days`} />
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader><h3 className="font-semibold">Emergency Contact</h3></CardHeader>
          <CardContent className="divide-y">
            <InfoRow label="Name" value={personal.emergencyContact?.name} />
            <InfoRow label="Relation" value={personal.emergencyContact?.relation} />
            <InfoRow icon={Phone} label="Phone" value={personal.emergencyContact?.phone} />
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader><h3 className="font-semibold">Bank & Statutory</h3></CardHeader>
          <CardContent className="divide-y">
            <InfoRow label="Bank Name" value={bank?.bankName} />
            <InfoRow label="Account Number" value={bank?.accountNumber} />
            <InfoRow label="IFSC Code" value={bank?.ifsc} />
            <InfoRow label="PAN" value={bank?.pan} />
            <InfoRow label="Aadhar" value={bank?.aadhar} />
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="lg:col-span-2">
          <CardHeader><h3 className="font-semibold">Documents</h3></CardHeader>
          <CardContent>
            {documents?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {documents.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
                    <FileText size={20} className="text-blue-600" />
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No documents uploaded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeView;
