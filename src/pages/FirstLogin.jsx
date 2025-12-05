import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card, CardContent, Select } from '../components/ui';
import api from '../api';

const FirstLogin = () => {
  const { user, changePassword, setSecurityQuestions } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);

  useEffect(() => {
    if (!user?.isFirstLogin && user?.hasSecurityQuestions) {
      navigate('/dashboard');
    }
    fetchQuestions();
  }, [user, navigate]);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/auth/security-questions');
      setQuestions(res.data);
    } catch {}
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestions = async (e) => {
    e.preventDefault();
    setError('');
    
    if (selectedQuestions.some(q => !q.question || !q.answer)) {
      setError('Please fill all questions and answers');
      return;
    }

    if (selectedQuestions[0].question === selectedQuestions[1].question) {
      setError('Please select different security questions');
      return;
    }
    
    setLoading(true);
    try {
      await setSecurityQuestions(selectedQuestions);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set security questions');
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (index, field, value) => {
    setSelectedQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const getAvailableQuestions = (currentIndex) => {
    const otherSelected = selectedQuestions
      .filter((_, i) => i !== currentIndex)
      .map(q => q.question);
    return questions.filter(q => !otherSelected.includes(q));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Welcome to HRMS</h1>
            <p className="text-gray-600 mt-2">
              {step === 1 ? 'Please change your password' : 'Set up security questions'}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
          )}

          {step === 1 ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" loading={loading}>
                Change Password
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSecurityQuestions} className="space-y-4">
              {selectedQuestions.map((sq, idx) => (
                <div key={idx} className="space-y-2">
                  <Select
                    label={`Security Question ${idx + 1}`}
                    options={[
                      { value: '', label: 'Select a question' },
                      ...getAvailableQuestions(idx).map(q => ({ value: q, label: q }))
                    ]}
                    value={sq.question}
                    onChange={e => updateQuestion(idx, 'question', e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Your answer"
                    value={sq.answer}
                    onChange={e => updateQuestion(idx, 'answer', e.target.value)}
                    required
                  />
                </div>
              ))}
              <Button type="submit" className="w-full" loading={loading}>
                Complete Setup
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstLogin;
