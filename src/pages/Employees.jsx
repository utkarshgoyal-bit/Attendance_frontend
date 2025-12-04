import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Card, CardHeader, CardContent, Button, Input, Table, Th, Td, Badge, Select, useToast } from '../components/ui';
import { Plus, Search, Eye, Edit, UserX, Filter } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const { error: showError } = useToast();

  const fetchEmployees = useCallback(async () => {
    try {
      const params = { search, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/employees', { params });
      setEmployees(res.data.employees);
    } catch (err) {
      showError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [search, filters, showError]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/settings/departments');
      setDepartments(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchEmployees(); fetchDepartments(); }, [fetchEmployees, fetchDepartments]);

  const statusColors = {
    Active: 'success', Probation: 'warning', Confirmed: 'success',
    'Notice Period': 'warning', Inactive: 'default', Absconding: 'danger', Terminated: 'danger'
  };

  const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Probation', label: 'Probation' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Notice Period', label: 'Notice Period' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employees</h2>
        <Link to="/employees/new">
          <Button><Plus size={18} className="mr-2" /> Add Employee</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input className="pl-10" placeholder="Search by name, email, ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} className="mr-2" /> Filters
            </Button>
          </div>
          {showFilters && (
            <div className="flex gap-4 mt-4">
              <Select
                options={[{ value: '', label: 'All Departments' }, ...departments.map(d => ({ value: d._id, label: d.name }))]}
                value={filters.department}
                onChange={e => setFilters({ ...filters, department: e.target.value })}
              />
              <Select
                options={STATUS_OPTIONS}
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No employees found</div>
          ) : (
            <Table>
              <thead className="bg-gray-50">
                <tr><Th>Employee</Th><Th>Department</Th><Th>Designation</Th><Th>Status</Th><Th>Joining</Th><Th>Actions</Th></tr>
              </thead>
              <tbody className="divide-y">
                {employees.map(emp => (
                  <tr key={emp._id} className="hover:bg-gray-50">
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          {emp.personal.firstName?.[0]}{emp.personal.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{emp.personal.firstName} {emp.personal.lastName}</p>
                          <p className="text-sm text-gray-500">{emp.eId} • {emp.personal.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>{emp.professional.department?.name || '-'}</Td>
                    <Td>{emp.professional.designation || '-'}</Td>
                    <Td><Badge variant={statusColors[emp.professional.status]}>{emp.professional.status}</Badge></Td>
                    <Td>{new Date(emp.professional.joiningDate).toLocaleDateString()}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <Link to={`/employees/${emp._id}`}><Button size="sm" variant="ghost"><Eye size={16} /></Button></Link>
                        <Link to={`/employees/${emp._id}/edit`}><Button size="sm" variant="ghost"><Edit size={16} /></Button></Link>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;
