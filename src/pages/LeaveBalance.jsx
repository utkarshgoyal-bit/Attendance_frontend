import { useState, useEffect } from 'react';
import api from '../api';
import { Card, CardHeader, CardContent, useToast } from '../components/ui';
import { Calendar, TrendingUp, TrendingDown, Award } from 'lucide-react';

const LeaveBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useToast();

  useEffect(() => { fetchBalance(); }, []);

  const fetchBalance = async () => {
    try {
      const res = await api.get('/leaves/balance');
      setBalance(res.data.balance);
    } catch (err) {
      showError('Failed to load leave balance');
    } finally {
      setLoading(false);
    }
  };

  const leaveTypeInfo = {
    CL: { name: 'Casual Leave', color: 'blue', icon: Calendar },
    SL: { name: 'Sick Leave', color: 'yellow', icon: TrendingDown },
    PL: { name: 'Paid Leave', color: 'green', icon: Award },
    LWP: { name: 'Leave Without Pay', color: 'red', icon: TrendingDown },
  };

  const getProgressColor = (used, total) => {
    if (!total) return 'bg-gray-300';
    const percentage = (used / total) * 100;
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!balance) {
    return <div className="p-8 text-center text-gray-500">No balance data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leave Balance</h2>
        <div className="text-sm text-gray-500">
          Year: <span className="font-semibold">{balance.year}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(balance.balances).map(([type, total]) => {
          const info = leaveTypeInfo[type] || { name: type, color: 'gray', icon: Calendar };
          const Icon = info.icon;
          const used = balance.used[type] || 0;
          const carry = balance.carryForward[type] || 0;
          const available = balance.available[type] || 0;
          const usedPercentage = total > 0 ? (used / total) * 100 : 0;

          return (
            <Card key={type} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{info.name}</p>
                    <p className="text-3xl font-bold text-gray-800">{available}</p>
                    <p className="text-xs text-gray-500 mt-1">Available</p>
                  </div>
                  <div className={`p-3 bg-${info.color}-100 rounded-lg`}>
                    <Icon className={`text-${info.color}-600`} size={24} />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Used: {used}</span>
                    <span>Total: {total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(used, total)}`}
                      style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Allocated:</span>
                    <span className="font-medium">{total}</span>
                  </div>
                  {carry > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Carried Forward:</span>
                      <span className="font-medium">+{carry}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-red-600">
                    <span>Used:</span>
                    <span className="font-medium">-{used}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t font-semibold">
                    <span>Available:</span>
                    <span>{available}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Leave Policy Information</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                i
              </div>
              <div>
                <p className="font-medium text-gray-700">Leave Calculation</p>
                <p className="text-gray-600">
                  Available Leave = Allocated + Carried Forward - Used
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-medium text-gray-700">Carry Forward</p>
                <p className="text-gray-600">
                  Unused leaves may be carried forward to next year as per company policy.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-xs font-bold flex-shrink-0">
                !
              </div>
              <div>
                <p className="font-medium text-gray-700">Leave Without Pay (LWP)</p>
                <p className="text-gray-600">
                  LWP can be applied even when other leave balances are exhausted. No balance required.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">
                ?
              </div>
              <div>
                <p className="font-medium text-gray-700">Need More Information?</p>
                <p className="text-gray-600">
                  Contact HR for leave policy details, encashment rules, or any questions about your leave balance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Allocated</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.values(balance.balances).reduce((sum, val) => sum + val, 0)}
                </p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Used</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.values(balance.used).reduce((sum, val) => sum + val, 0)}
                </p>
              </div>
              <TrendingDown className="text-red-600" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Available</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.values(balance.available).reduce((sum, val) => sum + val, 0)}
                </p>
              </div>
              <Award className="text-blue-600" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveBalance;