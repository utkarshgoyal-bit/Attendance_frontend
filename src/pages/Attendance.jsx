import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Card, CardContent, Button, useToast } from '../components/ui';
import { Clock, MapPin, CheckCircle } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => { fetchTodayAttendance(); getLocation(); }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => showError('Location permission denied')
      );
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await api.get('/attendance/today');
      setAttendance(res.data.attendance);
    } catch (err) {
      showError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!location) return showError('Location required');
    setChecking(true);
    try {
      const res = await api.post('/attendance/checkin', { location, method: 'GEO' });
      success('Check-in successful');
      setAttendance(res.data.attendance);
    } catch (err) {
      showError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try {
      const res = await api.post('/attendance/checkout', { location });
      success('Check-out successful');
      setAttendance(res.data.attendance);
    } catch (err) {
      showError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setChecking(false);
    }
  };

  const statusColors = {
    FULL_DAY: 'bg-green-100 text-green-700',
    LATE: 'bg-yellow-100 text-yellow-700',
    HALF_DAY: 'bg-orange-100 text-orange-700',
    ABSENT: 'bg-red-100 text-red-700',
    WFH: 'bg-blue-100 text-blue-700',
  };

  const StatusBadge = ({ status }) => (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.replace('_', ' ')}
    </span>
  );

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const now = new Date();
  const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Attendance</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-blue-600" size={32} />
              <div>
                <h3 className="text-lg font-semibold">Today's Attendance</h3>
                <p className="text-sm text-gray-500">{now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {!attendance ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  {location ? 'Location detected' : 'Getting location...'}
                </div>
                <Button onClick={handleCheckIn} loading={checking} className="w-full">
                  <CheckCircle size={18} className="mr-2" /> Check In
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Check-in</span>
                  <span className="font-semibold">{formatTime(attendance.checkIn.time)}</span>
                </div>
                {attendance.checkOut?.time ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Check-out</span>
                      <span className="font-semibold">{formatTime(attendance.checkOut.time)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Working Hours</span>
                      <span className="font-semibold">{attendance.workingHours?.toFixed(1)} hrs</span>
                    </div>
                  </>
                ) : (
                  <Button onClick={handleCheckOut} loading={checking} className="w-full" variant="secondary">
                    <CheckCircle size={18} className="mr-2" /> Check Out
                  </Button>
                )}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <StatusBadge status={attendance.status} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Present Days</span>
                <span className="text-2xl font-bold text-green-600">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Late Arrivals</span>
                <span className="text-2xl font-bold text-yellow-600">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Absent Days</span>
                <span className="text-2xl font-bold text-red-600">--</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;