import { useState, useEffect } from 'react';
import api from '../api';
import { Card, CardHeader, CardContent, Select, Badge, useToast } from '../components/ui';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const LeaveCalendar = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { error: showError } = useToast();

  useEffect(() => { fetchLeaves(); }, [currentDate]);

  const fetchLeaves = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await api.get(`/leaves/calendar?month=${month}&year=${year}`);
      setLeaves(res.data.leaves);
    } catch (err) {
      showError('Failed to load calendar');
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

  const getLeavesForDate = (date) => {
    if (!date) return [];
    
    return leaves.filter(leave => {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);
      const current = new Date(date);
      
      from.setHours(0, 0, 0, 0);
      to.setHours(0, 0, 0, 0);
      current.setHours(0, 0, 0, 0);
      
      return current >= from && current <= to;
    });
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

  const isWeekend = (date) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0; // Sunday
  };

  const days = getDaysInMonth();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Leave Calendar</h2>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold">{monthYear}</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
              >
                Today
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
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
                  const dayLeaves = date ? getLeavesForDate(date) : [];
                  const isTodayDate = isToday(date);
                  const isWeekendDate = isWeekend(date);
                  
                  return (
                    <div
                      key={idx}
                      className={`min-h-24 border rounded-lg p-2 ${
                        !date ? 'bg-gray-50' : 
                        isTodayDate ? 'bg-blue-50 border-blue-300' : 
                        isWeekendDate ? 'bg-gray-100' : 
                        'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {date && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            isTodayDate ? 'text-blue-600' : 
                            isWeekendDate ? 'text-gray-400' : 
                            'text-gray-700'
                          }`}>
                            {date.getDate()}
                          </div>
                          
                          {dayLeaves.length > 0 && (
                            <div className="space-y-1">
                              {dayLeaves.slice(0, 2).map(leave => (
                                <div
                                  key={leave._id}
                                  className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded truncate"
                                  title={`${leave.employeeId.personal?.firstName} ${leave.employeeId.personal?.lastName} - ${leave.leaveType}`}
                                >
                                  {leave.employeeId.personal?.firstName?.[0]}{leave.employeeId.personal?.lastName?.[0]} - {leave.leaveType}
                                </div>
                              ))}
                              {dayLeaves.length > 2 && (
                                <div className="text-xs text-gray-500 px-1.5">
                                  +{dayLeaves.length - 2} more
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
              <div className="mt-6 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
                  <span className="text-gray-600">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Weekend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded"></div>
                  <span className="text-gray-600">On Leave</span>
                </div>
              </div>

              {/* Leave List */}
              {leaves.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3">Leave Details for {monthYear}</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {leaves.map(leave => (
                      <div key={leave._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                            {leave.employeeId.personal?.firstName?.[0]}{leave.employeeId.personal?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium">
                              {leave.employeeId.personal?.firstName} {leave.employeeId.personal?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{leave.employeeId.eId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="info">{leave.leaveType}</Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">{leave.days} day{leave.days > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveCalendar;