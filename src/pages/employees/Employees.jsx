import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Table, Button, Input, Select, Badge, Toast, Card } from '../../components/ui';
import { api } from '../../services/api';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', role: '', status: 'active' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [toast, setToast] = useState(null);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getEmployees({
        page: pagination.page,
        limit: pagination.limit,
        search,
        ...filters
      });
      setEmployees(data.employees || []);
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
    } catch (error) {
      setToast({ message: 'Failed to load employees', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filters]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadEmployees();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) return;
    
    try {
      await api.deleteEmployee(id);
      setToast({ message: 'Employee deactivated', type: 'success' });
      loadEmployees();
    } catch (error) {
      setToast({ message: 'Failed to delete employee', type: 'error' });
    }
  };

  const columns = [
    { key: 'eId', label: 'ID' },
    { 
      key: 'name', 
      label: 'Name',
      render: (row) => `${row.firstName} ${row.lastName}`
    },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { 
      key: 'role', 
      label: 'Role',
      render: (row) => (
        <Badge variant={row.role === 'SUPER_ADMIN' ? 'info' : row.role === 'HR_ADMIN' ? 'success' : 'default'}>
          {row.role?.replace('_', ' ')}
        </Badge>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/employees/edit/${row._id}`}>
            <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout 
      title="Employees" 
      backTo="/home"
      actions={
        <Link to="/employees/add">
          <Button><Plus className="w-4 h-4" /> Add Employee</Button>
        </Link>
      }
    >
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Filters */}
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by name, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            options={[
              { value: '', label: 'All Departments' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'HR', label: 'HR' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Management', label: 'Management' }
            ]}
          />
          <Select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'EMPLOYEE', label: 'Employee' },
              { value: 'MANAGER', label: 'Manager' },
              { value: 'HR_ADMIN', label: 'HR Admin' },
              { value: 'SUPER_ADMIN', label: 'Super Admin' }
            ]}
          />
          <Button type="submit"><Search className="w-4 h-4" /> Search</Button>
        </form>
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} data={employees} loading={loading} />
        
        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.page * pagination.limit >= pagination.total}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default Employees;
