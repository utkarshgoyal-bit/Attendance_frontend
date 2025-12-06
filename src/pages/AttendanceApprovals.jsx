import { useState, useEffect } from 'react';
import api from '../api';
import { Card, CardHeader, CardContent, Button, Table, Th, Td, Badge, Modal, Input, useToast } from '../components/ui';
import { CheckCircle, XCircle } from 'lucide-react';

const AttendanceApprovals = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [remarks, setRemarks] = useState('');
  const { success, error: showError } = useToast();

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/attendance/pending');
      setPending(res.data.attendance);
    } catch (err) {
      showError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await api.put(`/attendance/${id}/approve`, { status, remarks });
      success(`Regularization ${status.toLowerCase()}`);
      setShowModal(false);
      setRemarks('');
      fetchPending();
    } catch (err) {
      showError('Operation failed');
    }
  };

  const openApprovalModal = (attendance) => {
    setSelectedAttendance(attendance);
    setShowModal(true);
  };

  const statusColors = {
    FULL_DAY: 'success', LATE: 'warning', HALF_DAY: 'warning', ABSENT: 'danger', WFH: 'info'
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Attendance Approvals</h2>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Pending Regularization Requests</h3>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : pending.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending requests</div>
          ) : (
            <Table>
              <thead className="bg-gray-50">
                <tr>
                  <Th>Employee</Th>
                  <Th>Date</Th>
                  <Th>Check-in</Th>
                  <Th>Status</Th>
                  <Th>Reason</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pending.map(att => (
                  <tr key={att._id} className="hover:bg-gray-50">
                    <Td className="font-medium">
                      {att.employeeId.personal?.firstName} {att.employeeId.personal?.lastName}
                      <div className="text-xs text-gray-500">{att.employeeId.eId}</div>
                    </Td>
                    <Td>{new Date(att.date).toLocaleDateString()}</Td>
                    <Td>{new Date(att.checkIn.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Td>
                    <Td><Badge variant={statusColors[att.status]}>{att.status}</Badge></Td>
                    <Td>{att.regularization.reason}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { setSelectedAttendance(att); handleApprove(att._id, 'APPROVED'); }} title="Approve">
                          <CheckCircle size={16} className="text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openApprovalModal(att)} title="Reject">
                          <XCircle size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Reject Regularization">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Employee: <strong>{selectedAttendance?.employeeId.personal?.firstName} {selectedAttendance?.employeeId.personal?.lastName}</strong>
          </p>
          <Input label="Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Reason for rejection" />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleApprove(selectedAttendance._id, 'REJECTED')}>Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceApprovals;