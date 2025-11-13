import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CalculateEmi from './CalculateEmi';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'EMPLOYEE') {
      navigate('/dashboard/employee');
    } else if (user?.role === 'MANAGER') {
      navigate('/dashboard/manager');
    } else if (user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN') {
      navigate('/dashboard/hr');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    navigate('/');
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-xl text-gray-700">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default Home;
