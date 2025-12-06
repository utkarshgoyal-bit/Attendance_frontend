import { useState, useEffect } from 'react';
import api from '../api';
import { Card, CardHeader, CardContent, Button, Input, Select, Modal, Table, Th, Td, Badge, useToast } from '../components/ui';
import { Plus, Calendar, XCircle } from 'lucide-react';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const { success, error: showError } = useToast();
  
  const [form, setForm] = useState({
    leaveType: 'CL',
    fromDate: '',
    toDate: '',
    reason: '',
    isHalfDay: false,
    halfDayType: '',
    contactNumber: '',
  });

  useEffect(() => { fetchLeaves(); fetchBalance(); }, []);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      setLeaves(res.data.leaves);
    } catch (err) {
      showError('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await api.get('/leaves/balance');
      setBalance(res.data.balance);
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves/apply', form);
      success('Leave application submitted');
      setShowModal(false);
      setForm({
        leaveType: 'CL',
        fromDate: '',
        toDate: '',
        reason: '',
        isHalfDay: false,
        halfDayType: '',
        contactNumber: '',
      });
      fetchLeaves();
      fetchBalance();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to apply leave');
    }
  };

  const handleCancel = async () => {
    try {
      await api.delete(`/leaves/${selectedLeave._id}`, { data: { reason: cancellationReason } });
      success('Leave cancelled');
      setShowCancelModal(false);
      setCancellationReason('');
      fetchLeaves();
      fetchBalance();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const openCancelModal = (leave) => {
    setSelectedLeave(leave);
    setShowCancelModal(true);
  };

  const statusColors = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'default',
  };

  const leaveTypes = [
    { value: 'CL', label: 'Casual Leave' },
    { value: 'SL', label: 'Sick Leave' },
    { value: 'PL', label: 'Paid Leave' },
    { value: 'LWP', label: 'Leave Without Pay' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Leaves</h2>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" /> Apply Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(balance.available).map(([type, available]) => (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{leaveTypes.find(t => t.value === type)?.label || type}</p>
                    <p className="text-2xl font-bold text-blue-600">{available}</p>
                    <p className="text-xs text-gray-500">
                      Used: {balance.used[type] || 0} / Total: {balance.balances[type] || 0}
                    </p>
                  </div>
                  <Calendar className="text-blue-600" size={32} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Leave History */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Leave History</h3>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : leaves.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No leave applications found</div>
          ) : (
            <Table>
              <thead className="bg-gray-50">
                <tr>
                  <Th>Leave Type</Th>
                  <Th>From Date</Th>
                  <Th>To Date</Th>
                  <Th>Days</Th>
                  <Th>Reason</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leaves.map(leave => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <Td className="font-medium">{leave.leaveType}</Td>
                    <Td>{new Date(leave.fromDate).toLocaleDateString()}</Td>
                    <Td>{new Date(leave.toDate).toLocaleDateString()}</Td>
                    <Td>{leave.days} {leave.isHalfDay && '(Half)'}</Td>
                    <Td className="max-w-xs truncate">{leave.reason}</Td>
                    <Td>
                      <Badge variant={statusColors[leave.status]}>{leave.status}</Badge>
                      {leave.approverRemarks && (
                        <p className="text-xs text-gray-500 mt-1">{leave.approverRemarks}</p>
                      )}
                    </Td>
                    <Td>
                      {(leave.status === 'PENDING' || (leave.status === 'APPROVED' && new Date(leave.fromDate) > new Date())) && (
                        <Button size="sm" variant="ghost" onClick={() => openCancelModal(leave)} title="Cancel Leave">
                          <XCircle size={16} className="text-red-500" />
                        </Button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply for Leave" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Leave Type *"
            options={leaveTypes}
            value={form.leaveType}
            onChange={e => setForm({ ...form, leaveType: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Date *"
              type="date"
              value={form.fromDate}
              onChange={e => setForm({ ...form, fromDate: e.target.value })}
              required
            />
            <Input
              label="To Date *"
              type="date"
              value={form.toDate}
              onChange={e => setForm({ ...form, toDate: e.target.value })}
              min={form.fromDate}
              required
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isHalfDay}
              onChange={e => setForm({ ...form, isHalfDay: e.target.checked, halfDayType: '' })}
              className="rounded"
            />
            Half Day Leave
          </label>

          {form.isHalfDay && (
            <Select
              label="Half Day Type"
              options={[
                { value: '', label: 'Select' },
                { value: 'FIRST_HALF', label: 'First Half' },
                { value: 'SECOND_HALF', label: 'Second Half' },
              ]}
              value={form.halfDayType}
              onChange={e => setForm({ ...form, halfDayType: e.target.value })}
              required
            />
          )}

          <Input
            label="Reason *"
            value={form.reason}
            onChange={e => setForm({ ...form, reason: e.target.value })}
            placeholder="Brief reason for leave"
            required
          />

          <Input
            label="Contact Number"
            value={form.contactNumber}
            onChange={e => setForm({ ...form, contactNumber: e.target.value })}
            placeholder="Contact during leave"
          />

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Submit Application</Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Leave Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Leave">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel this leave application?
          </p>
          {selectedLeave && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm"><strong>Type:</strong> {selectedLeave.leaveType}</p>
              <p className="text-sm"><strong>Dates:</strong> {new Date(selectedLeave.fromDate).toLocaleDateString()} - {new Date(selectedLeave.toDate).toLocaleDateString()}</p>
              <p className="text-sm"><strong>Days:</strong> {selectedLeave.days}</p>
            </div>
          )}
          <Input
            label="Cancellation Reason"
            value={cancellationReason}
            onChange={e => setCancellationReason(e.target.value)}
            placeholder="Why are you cancelling?"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>No, Keep It</Button>
            <Button variant="danger" onClick={handleCancel}>Yes, Cancel Leave</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Leaves;