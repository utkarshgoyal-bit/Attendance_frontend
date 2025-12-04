import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Card, CardHeader, CardContent, Button, Input, Modal, Table, Th, Td, Badge, useToast } from '../components/ui';
import { Plus, Edit, Trash2, Building2, Clock, Users, FileText } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('departments');
  const [data, setData] = useState({ departments: [], branches: [], shifts: [], customFields: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const [depts, branches, shifts, fields] = await Promise.all([
        api.get('/settings/departments'),
        api.get('/settings/branches'),
        api.get('/settings/shifts'),
        api.get('/settings/custom-fields'),
      ]);
      setData({ departments: depts.data, branches: branches.data, shifts: shifts.data, customFields: fields.data });
    } catch (err) {
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    if (type === 'department') setForm(item || { name: '', code: '', description: '' });
    else if (type === 'branch') setForm(item || { name: '', code: '', address: { city: '', state: '' }, contact: { email: '', phone: '' } });
    else if (type === 'shift') setForm(item || { name: '', code: '', startTime: '09:00', endTime: '18:00', gracePeriod: 15, lateThreshold: 30, halfDayThreshold: 120, isDefault: false });
    else if (type === 'customField') setForm(item || { name: '', fieldType: 'text', options: [], placeholder: '', isRequired: false });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/settings/${activeTab}`;
      if (editItem) {
        await api.put(`${endpoint}/${editItem._id}`, form);
        success(`${modalType} updated`);
      } else {
        await api.post(endpoint, form);
        success(`${modalType} created`);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/settings/${type}/${id}`);
      success('Deleted successfully');
      fetchData();
    } catch (err) {
      showError('Delete failed');
    }
  };

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2, type: 'department' },
    { id: 'branches', label: 'Branches', icon: Building2, type: 'branch' },
    { id: 'shifts', label: 'Shifts', icon: Clock, type: 'shift' },
    { id: 'custom-fields', label: 'Custom Fields', icon: FileText, type: 'customField' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Organization Settings</h2>

      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-600'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="font-semibold capitalize">{activeTab.replace('-', ' ')}</h3>
          <Button onClick={() => openModal(tabs.find(t => t.id === activeTab)?.type)}>
            <Plus size={18} className="mr-2" /> Add
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <>
              {/* Departments Table */}
              {activeTab === 'departments' && (
                <Table>
                  <thead className="bg-gray-50"><tr><Th>Name</Th><Th>Code</Th><Th>Description</Th><Th>Actions</Th></tr></thead>
                  <tbody className="divide-y">
                    {data.departments.map(d => (
                      <tr key={d._id} className="hover:bg-gray-50">
                        <Td className="font-medium">{d.name}</Td>
                        <Td>{d.code || '-'}</Td>
                        <Td>{d.description || '-'}</Td>
                        <Td>
                          <Button size="sm" variant="ghost" onClick={() => openModal('department', d)}><Edit size={16} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('departments', d._id)}><Trash2 size={16} className="text-red-500" /></Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {/* Branches Table */}
              {activeTab === 'branches' && (
                <Table>
                  <thead className="bg-gray-50"><tr><Th>Name</Th><Th>Code</Th><Th>Location</Th><Th>Contact</Th><Th>Actions</Th></tr></thead>
                  <tbody className="divide-y">
                    {data.branches.map(b => (
                      <tr key={b._id} className="hover:bg-gray-50">
                        <Td className="font-medium">{b.name} {b.isHeadOffice && <Badge variant="info">HQ</Badge>}</Td>
                        <Td>{b.code || '-'}</Td>
                        <Td>{b.address?.city}, {b.address?.state}</Td>
                        <Td>{b.contact?.phone || '-'}</Td>
                        <Td>
                          <Button size="sm" variant="ghost" onClick={() => openModal('branch', b)}><Edit size={16} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('branches', b._id)}><Trash2 size={16} className="text-red-500" /></Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {/* Shifts Table */}
              {activeTab === 'shifts' && (
                <Table>
                  <thead className="bg-gray-50"><tr><Th>Name</Th><Th>Timing</Th><Th>Grace</Th><Th>Late Threshold</Th><Th>Actions</Th></tr></thead>
                  <tbody className="divide-y">
                    {data.shifts.map(s => (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <Td className="font-medium">{s.name} {s.isDefault && <Badge variant="success">Default</Badge>}</Td>
                        <Td>{s.startTime} - {s.endTime}</Td>
                        <Td>{s.gracePeriod} mins</Td>
                        <Td>{s.lateThreshold} mins</Td>
                        <Td>
                          <Button size="sm" variant="ghost" onClick={() => openModal('shift', s)}><Edit size={16} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('shifts', s._id)}><Trash2 size={16} className="text-red-500" /></Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {/* Custom Fields Table */}
              {activeTab === 'custom-fields' && (
                <Table>
                  <thead className="bg-gray-50"><tr><Th>Name</Th><Th>Type</Th><Th>Required</Th><Th>Actions</Th></tr></thead>
                  <tbody className="divide-y">
                    {data.customFields.map(f => (
                      <tr key={f._id} className="hover:bg-gray-50">
                        <Td className="font-medium">{f.name}</Td>
                        <Td><Badge>{f.fieldType}</Badge></Td>
                        <Td>{f.isRequired ? 'Yes' : 'No'}</Td>
                        <Td>
                          <Button size="sm" variant="ghost" onClick={() => openModal('customField', f)}><Edit size={16} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('custom-fields', f._id)}><Trash2 size={16} className="text-red-500" /></Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {data[activeTab.replace('-', '')]?.length === 0 && (
                <div className="p-8 text-center text-gray-500">No items found. Click Add to create one.</div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${editItem ? 'Edit' : 'Add'} ${modalType}`} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalType === 'department' && (
            <>
              <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <Input label="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </>
          )}
          {modalType === 'branch' && (
            <>
              <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <Input label="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" value={form.address?.city} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
                <Input label="State" value={form.address?.state} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Email" value={form.contact?.email} onChange={e => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} />
                <Input label="Phone" value={form.contact?.phone} onChange={e => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })} />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isHeadOffice} onChange={e => setForm({ ...form, isHeadOffice: e.target.checked })} />
                Head Office
              </label>
            </>
          )}
          {modalType === 'shift' && (
            <>
              <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Time *" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
                <Input label="End Time *" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Grace (mins)" type="number" value={form.gracePeriod} onChange={e => setForm({ ...form, gracePeriod: parseInt(e.target.value) })} />
                <Input label="Late Threshold" type="number" value={form.lateThreshold} onChange={e => setForm({ ...form, lateThreshold: parseInt(e.target.value) })} />
                <Input label="Half-day Threshold" type="number" value={form.halfDayThreshold} onChange={e => setForm({ ...form, halfDayThreshold: parseInt(e.target.value) })} />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                Set as Default Shift
              </label>
            </>
          )}
          {modalType === 'customField' && (
            <>
              <Input label="Field Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Field Type</label>
                  <select value={form.fieldType} onChange={e => setForm({ ...form, fieldType: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="amount">Amount</option>
                  </select>
                </div>
                <Input label="Placeholder" value={form.placeholder} onChange={e => setForm({ ...form, placeholder: e.target.value })} />
              </div>
              {form.fieldType === 'dropdown' && (
                <Input label="Options (comma separated)" value={form.options?.join(', ')} onChange={e => setForm({ ...form, options: e.target.value.split(',').map(s => s.trim()) })} />
              )}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isRequired} onChange={e => setForm({ ...form, isRequired: e.target.checked })} />
                Required Field
              </label>
            </>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;
