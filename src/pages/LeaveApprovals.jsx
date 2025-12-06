import { useState, useEffect } from 'react';
import api from '../api';
import { Card, CardHeader, CardContent, Button, Table, Th, Td, Badge, Modal, Input, useToast } from '../components/ui';
import { CheckCircle, XCircle } from 'lucide-react';

const LeaveApprovals = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [action, setAction] = useState(''); // 'approve' or 'reject'
  const [remarks, setRemarks] = useState('');
  const { success, error: showError } = useToast();

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/leaves/pending');
      setPending(res.data.leaves);
    } catch (err) {
      showError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId, directApprove = false) => {
    try {
      await api.put(`/leaves/${leaveId}/approve`, { remarks: directApprove ? '' : remarks });
      success('Leave approved');
      setShowModal(false);
      setRemarks('');
      fetchPending();
    } catch (err) {
      showError('Approval failed');
    }
  };

  const handleReject = async (leaveId) => {
    try {
      await api.put(`/leaves/${leaveId}/reject`, { remarks });
      success('Leave rejected');
      setShowModal(false);
      setRemarks('');
      fetchPending();
    } catch (err) {
      showError('Rejection failed');
    }
  };

  const openModal = (leave, actionType) => {
    setSelectedLeave(leave);
    setAction(actionType);
    setShowModal(true);
  };

  const statusColors = {
    CL: 'info',
    SL: 'warning',
    PL: 'success',
    LWP: 'danger',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Leave Approvals</h2>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Pending Leave Requests</h3>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : pending.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending leave requests</div>
          ) : (
            <Table>
              <thead className="bg-gray-50">
                <tr>
                  <Th>Employee</Th>
                  <Th>Leave Type</Th>
                  <Th>From Date</Th>
                  <Th>To Date</Th>
                  <Th>Days</Th>
                  <Th>Reason</Th>
                  <Th>Applied On</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pending.map(leave => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <Td className="font-medium">
                      <div>
                        <p>{leave.employeeId.personal?.firstName} {leave.employeeId.personal?.lastName}</p>
                        <p className="text-xs text-gray-500">{leave.employeeId.eId}</p>
                        <p className="text-xs text-gray-500">{leave.employeeId.professional?.department?.name}</p>
                      </div>
                    </Td>
                    <Td>
                      <Badge variant={statusColors[leave.leaveType] || 'default'}>{leave.leaveType}</Badge>
                      {leave.isHalfDay && <p className="text-xs text-gray-500 mt-1">Half Day</p>}
                    </Td>
                    <Td>{new Date(leave.fromDate).toLocaleDateString()}</Td>
                    <Td>{new Date(leave.toDate).toLocaleDateString()}</Td>
                    <Td>{leave.days}</Td>
                    <Td className="max-w-xs">
                      <p className="truncate" title={leave.reason}>{leave.reason}</p>
                      {leave.contactNumber && (
                        <p className="text-xs text-gray-500">📞 {leave.contactNumber}</p>
                      )}
                    </Td>
                    <Td>{new Date(leave.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(leave._id, true)} 
                          title="Approve"
                        >
                          <CheckCircle size={16} className="text-green-600" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => openModal(leave, 'reject')} 
                          title="Reject"
                        >
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

      {/* Approval/Rejection Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={action === 'approve' ? 'Approve Leave' : 'Reject Leave'}
      >
        <div className="space-y-4">
          {selectedLeave && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm"><strong>Employee:</strong> {selectedLeave.employeeId.personal?.firstName} {selectedLeave.employeeId.personal?.lastName}</p>
              <p className="text-sm"><strong>Type:</strong> {selectedLeave.leaveType}</p>
              <p className="text-sm"><strong>Dates:</strong> {new Date(selectedLeave.fromDate).toLocaleDateString()} - {new Date(selectedLeave.toDate).toLocaleDateString()}</p>
              <p className="text-sm"><strong>Days:</strong> {selectedLeave.days}</p>
              <p className="text-sm"><strong>Reason:</strong> {selectedLeave.reason}</p>
            </div>
          )}
          
          <Input
            label={action === 'reject' ? 'Rejection Reason *' : 'Remarks (Optional)'}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder={action === 'reject' ? 'Why are you rejecting this leave?' : 'Any comments for the employee'}
            required={action === 'reject'}
          />

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            {action === 'approve' ? (
              <Button onClick={() => handleApprove(selectedLeave._id)}>Approve Leave</Button>
            ) : (
              <Button variant="danger" onClick={() => handleReject(selectedLeave._id)}>Reject Leave</Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveApprovals;