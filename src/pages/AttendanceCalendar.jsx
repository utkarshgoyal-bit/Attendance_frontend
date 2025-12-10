import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Card, CardHeader, CardContent, Select, Badge, useToast } from '../components/ui';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download } from 'lucide-react';

const AttendanceCalendar = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'team'
  const [selectedEmployee, setSelectedEmployee] = useState('me');
  const { error: showError } = useToast();

  const isManager = ['MANAGER', 'HR_ADMIN', 'ORG_ADMIN'].includes(user?.role);

  useEffect(() => {
    if (isManager && viewMode === 'team') {
      fetchTeamEmployees();
    }
  }, [viewMode]);

  useEffect(() => {
    fetchAttendance();
  }, [currentDate, viewMode, selectedEmployee]);

  const fetchTeamEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.employees || []);
    } catch (err) {
      showError('Failed to load team members');
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      let endpoint = '/attendance/my';
      let params = { month, year };

      if (viewMode === 'team' && isManager) {
        endpoint = '/attendance/team';
      } else if (selectedEmployee !== 'me' && isManager) {
        endpoint = `/attendance/employee/${selectedEmployee}`;
      }

      const res = await api.get(endpoint, { params });
      setAttendance(res.data.attendance || []);
    } catch (err) {
      showError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startPadding = firstDay.getDay(); // 0 = Sunday
    
    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getAttendanceForDate = (date) => {
    if (!date) return null;
    
    const dateStr = date.toISOString().split('T')[0];
    return attendance.find(att => {
      const attDateStr = new Date(att.date).toISOString().split('T')[0];
      return attDateStr === dateStr;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      PRESENT: 'bg-green-100 border-green-300 text-green-700',
      FULL_DAY: 'bg-green-100 border-green-300 text-green-700',
      LATE: 'bg-yellow-100 border-yellow-300 text-yellow-700',
      HALF_DAY: 'bg-orange-100 border-orange-300 text-orange-700',
      ABSENT: 'bg-red-100 border-red-300 text-red-700',
      WFH: 'bg-blue-100 border-blue-300 text-blue-700',
      ON_DUTY: 'bg-purple-100 border-purple-300 text-purple-700',
      WEEK_OFF: 'bg-gray-100 border-gray-300 text-gray-600',
      HOLIDAY: 'bg-pink-100 border-pink-300 text-pink-700',
      LEAVE: 'bg-indigo-100 border-indigo-300 text-indigo-700',
    };
    return colors[status] || 'bg-white border-gray-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PRESENT: 'P',
      FULL_DAY: 'P',
      LATE: 'L',
      HALF_DAY: 'H',
      ABSENT: 'A',
      WFH: 'W',
      ON_DUTY: 'O',
      WEEK_OFF: 'WO',
      HOLIDAY: 'H',
      LEAVE: 'LV',
    };
    return labels[status] || '-';
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFutureDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const exportCalendar = () => {
    // Simple CSV export
    const month = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let csv = `Date,Status,Check In,Check Out,Hours\n`;
    
    attendance.forEach(att => {
      const date = new Date(att.date).toLocaleDateString();
      const checkIn = att.checkIn?.time ? new Date(att.checkIn.time).toLocaleTimeString() : '-';
      const checkOut = att.checkOut?.time ? new Date(att.checkOut.time).toLocaleTimeString() : '-';
      const hours = att.workingHours ? (att.workingHours / 60).toFixed(2) : '-';
      csv += `${date},${att.status},${checkIn},${checkOut},${hours}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${month.replace(' ', '-')}.csv`;
    a.click();
  };

  const days = getDaysInMonth();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate summary stats
  const summary = {
    present: attendance.filter(a => ['PRESENT', 'FULL_DAY'].includes(a.status)).length,
    late: attendance.filter(a => a.status === 'LATE').length,
    halfDay: attendance.filter(a => a.status === 'HALF_DAY').length,
    absent: attendance.filter(a => a.status === 'ABSENT').length,
    wfh: attendance.filter(a => a.status === 'WFH').length,
    leave: attendance.filter(a => a.status === 'LEAVE').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-blue-600" size={32} />
          <div>
            <h2 className="text-2xl font-bold">Attendance Calendar</h2>
            <p className="text-sm text-gray-500">{monthYear}</p>
          </div>
        </div>
        <button
          onClick={exportCalendar}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* View Mode */}
            {isManager && (
              <Select
                value={viewMode}
                onChange={(e) => {
                  setViewMode(e.target.value);
                  setSelectedEmployee('me');
                }}
                options={[
                  { value: 'individual', label: 'Individual View' },
                  { value: 'team', label: 'Team View' },
                ]}
              />
            )}

            {/* Employee Selector (for individual view) */}
            {viewMode === 'individual' && isManager && (
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                options={[
                  { value: 'me', label: 'My Attendance' },
                  ...employees.map(emp => ({
                    value: emp._id,
                    label: `${emp.personal?.firstName} ${emp.personal?.lastName} (${emp.eId})`
                  }))
                ]}
              />
            )}

            {/* Month Navigation */}
            <div className="flex gap-2 justify-end md:col-span-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg border"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 border border-blue-200"
              >
                Today
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg border"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">{monthYear} - Attendance</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading calendar...</p>
            </div>
          ) : (
            <div>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {days.map((date, idx) => {
                  const att = date ? getAttendanceForDate(date) : null;
                  const isTodayDate = isToday(date);
                  const future = isFutureDate(date);
                  
                  return (
                    <div
                      key={idx}
                      className={`min-h-20 border rounded-lg p-2 ${
                        !date ? 'bg-gray-50' : 
                        future ? 'bg-gray-50 opacity-50' :
                        isTodayDate ? 'ring-2 ring-blue-400' : 
                        'bg-white hover:shadow-md'
                      } ${att ? getStatusColor(att.status) : ''} transition-all`}
                    >
                      {date && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            isTodayDate ? 'text-blue-600 font-bold' : 'text-gray-700'
                          }`}>
                            {date.getDate()}
                          </div>
                          
                          {att && !future && (
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-center">
                                {getStatusLabel(att.status)}
                              </div>
                              {att.checkIn?.time && (
                                <div className="text-xs text-center">
                                  {new Date(att.checkIn.time).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              )}
                              {att.workingHours > 0 && (
                                <div className="text-xs text-center font-medium">
                                  {(att.workingHours / 60).toFixed(1)}h
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-sm">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span className="text-sm">Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-100 border border-orange-300 rounded"></div>
                    <span className="text-sm">Half Day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 border border-red-300 rounded"></div>
                    <span className="text-sm">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded"></div>
                    <span className="text-sm">WFH</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-100 border border-indigo-300 rounded"></div>
                    <span className="text-sm">Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 border border-purple-300 rounded"></div>
                    <span className="text-sm">On Duty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
                    <span className="text-sm">Week Off</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-pink-100 border border-pink-300 rounded"></div>
                    <span className="text-sm">Holiday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-400 rounded"></div>
                    <span className="text-sm">Today</span>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Monthly Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                    <p className="text-xs text-gray-600">Present</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
                    <p className="text-xs text-gray-600">Late</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{summary.halfDay}</p>
                    <p className="text-xs text-gray-600">Half Day</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                    <p className="text-xs text-gray-600">Absent</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{summary.wfh}</p>
                    <p className="text-xs text-gray-600">WFH</p>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{summary.leave}</p>
                    <p className="text-xs text-gray-600">Leave</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceCalendar;