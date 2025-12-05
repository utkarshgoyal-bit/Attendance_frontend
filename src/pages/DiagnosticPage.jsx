import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const DiagnosticPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logs, setLogs] = useState([]);
  const [testResults, setTestResults] = useState({});

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    addLog('DiagnosticPage mounted', 'success');
    addLog(`Current location: ${location.pathname}`, 'info');
    addLog(`User loading state: ${loading}`, 'info');
    addLog(`User data: ${user ? 'Present' : 'Null'}`, user ? 'success' : 'warning');
    
    if (user) {
      addLog(`User email: ${user.email}`, 'info');
      addLog(`User role: ${user.role}`, 'info');
      addLog(`User ID: ${user.id}`, 'info');
    }
  }, [user, loading, location]);

  const runTests = async () => {
    setLogs([]);
    setTestResults({});
    
    // Test 1: Check localStorage
    addLog('TEST 1: Checking localStorage...', 'info');
    const token = localStorage.getItem('token');
    const hasToken = !!token;
    setTestResults(prev => ({ ...prev, localStorage: hasToken }));
    addLog(`Token exists: ${hasToken}`, hasToken ? 'success' : 'error');
    
    if (hasToken) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        addLog(`Token payload: ${JSON.stringify(payload)}`, 'info');
        addLog(`Token role: ${payload.role}`, 'info');
      } catch (e) {
        addLog(`Token parse error: ${e.message}`, 'error');
      }
    }

    // Test 2: Check user context
    addLog('TEST 2: Checking user context...', 'info');
    const hasUser = !!user;
    setTestResults(prev => ({ ...prev, userContext: hasUser }));
    addLog(`User in context: ${hasUser}`, hasUser ? 'success' : 'error');

    // Test 3: Test backend health
    addLog('TEST 3: Testing backend health...', 'info');
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setTestResults(prev => ({ ...prev, backendHealth: true }));
      addLog(`Backend health: OK - ${JSON.stringify(data)}`, 'success');
    } catch (err) {
      setTestResults(prev => ({ ...prev, backendHealth: false }));
      addLog(`Backend health: FAILED - ${err.message}`, 'error');
    }

    // Test 4: Test /auth/me endpoint
    addLog('TEST 4: Testing /auth/me endpoint...', 'info');
    if (hasToken) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTestResults(prev => ({ ...prev, authMe: true }));
          addLog(`/auth/me: SUCCESS - ${JSON.stringify(data)}`, 'success');
        } else {
          const errorText = await response.text();
          setTestResults(prev => ({ ...prev, authMe: false }));
          addLog(`/auth/me: FAILED (${response.status}) - ${errorText}`, 'error');
        }
      } catch (err) {
        setTestResults(prev => ({ ...prev, authMe: false }));
        addLog(`/auth/me: ERROR - ${err.message}`, 'error');
      }
    } else {
      addLog('/auth/me: SKIPPED (no token)', 'warning');
    }

    // Test 5: Test /organizations endpoint
    addLog('TEST 5: Testing /organizations endpoint...', 'info');
    if (hasToken) {
      try {
        const response = await fetch('http://localhost:5000/api/organizations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTestResults(prev => ({ ...prev, organizations: true }));
          addLog(`/organizations: SUCCESS - Found ${data.organizations?.length || 0} orgs`, 'success');
        } else {
          const errorText = await response.text();
          setTestResults(prev => ({ ...prev, organizations: false }));
          addLog(`/organizations: FAILED (${response.status}) - ${errorText}`, 'error');
        }
      } catch (err) {
        setTestResults(prev => ({ ...prev, organizations: false }));
        addLog(`/organizations: ERROR - ${err.message}`, 'error');
      }
    } else {
      addLog('/organizations: SKIPPED (no token)', 'warning');
    }

    // Test 6: Test /users endpoint
    addLog('TEST 6: Testing /users endpoint...', 'info');
    if (hasToken) {
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTestResults(prev => ({ ...prev, users: true }));
          addLog(`/users: SUCCESS - Found ${data.users?.length || 0} users`, 'success');
        } else {
          const errorText = await response.text();
          setTestResults(prev => ({ ...prev, users: false }));
          addLog(`/users: FAILED (${response.status}) - ${errorText}`, 'error');
        }
      } catch (err) {
        setTestResults(prev => ({ ...prev, users: false }));
        addLog(`/users: ERROR - ${err.message}`, 'error');
      }
    } else {
      addLog('/users: SKIPPED (no token)', 'warning');
    }

    addLog('All tests completed!', 'success');
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-700 bg-green-50';
      case 'error': return 'text-red-700 bg-red-50';
      case 'warning': return 'text-yellow-700 bg-yellow-50';
      default: return 'text-blue-700 bg-blue-50';
    }
  };

  const getResultIcon = (result) => {
    if (result === true) return '✅';
    if (result === false) return '❌';
    return '⏳';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 System Diagnostics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Current State */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Current State</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Location:</strong> {location.pathname}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? '✅ Present' : '❌ Null'}</p>
            {user && (
              <>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </>
            )}
            <p><strong>Token:</strong> {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</p>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Test Results</h3>
          <div className="space-y-1 text-sm">
            <p>{getResultIcon(testResults.localStorage)} localStorage</p>
            <p>{getResultIcon(testResults.userContext)} User Context</p>
            <p>{getResultIcon(testResults.backendHealth)} Backend Health</p>
            <p>{getResultIcon(testResults.authMe)} /auth/me</p>
            <p>{getResultIcon(testResults.organizations)} /organizations</p>
            <p>{getResultIcon(testResults.users)} /users</p>
          </div>
        </div>
      </div>

      {/* Run Tests Button */}
      <div className="mb-6">
        <button
          onClick={runTests}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
        >
          🔄 Run All Tests
        </button>
      </div>

      {/* Navigation Test Buttons */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">Navigation Tests</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Go to Dashboard
          </button>
          <button onClick={() => navigate('/organizations')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Go to Organizations
          </button>
          <button onClick={() => navigate('/users')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Go to Users
          </button>
          <button onClick={() => navigate('/employees')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Go to Employees
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Diagnostic Logs</h3>
        <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Click "Run All Tests" to start.</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className={`p-2 rounded ${getLogColor(log.type)}`}>
                <span className="text-gray-600">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Actions */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <h3 className="font-semibold mb-3">Manual Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              localStorage.clear();
              addLog('Cleared localStorage', 'warning');
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Clear localStorage
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Reload Page
          </button>
          <button
            onClick={() => {
              console.log('User object:', user);
              console.log('Token:', localStorage.getItem('token'));
              addLog('Logged to console', 'info');
            }}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Log to Console
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;