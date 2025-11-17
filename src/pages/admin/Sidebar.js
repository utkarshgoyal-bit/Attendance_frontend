import { CircleDollarSign, Settings, DollarSign } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';


const Sidebar = () => {
  return (
    <div className="h-screen bg-gray-100 text-blue-950 w-16 hover:w-52 transition-all duration-300 ease-in-out group border-r-2 border-gray-200 shadow-lg flex flex-col items-center">

      <div className="mt-8 flex justify-center">
        <img src="/logo2.png" alt="Logo" className="w-13 h-12 px-2" />
      </div>

      <div className="flex flex-col items-center mt-28 w-full">
        {/* HR Admin and Super Admin only */}
        <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
          <Link
            to="/admin/salary-components"
            className="flex items-center w-full px-3 py-3 hover:bg-gray-200 transition-all duration-200"
          >
            <div className="flex justify-center w-14">
              <Settings className="w-6 h-6 flex-shrink-0" />
            </div>
            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Salary Components
            </span>
          </Link>
        </RoleGuard>

        {/* HR Admin and Super Admin only */}
        <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
          <Link
            to="/admin/salary-processing"
            className="flex items-center w-full px-3 py-3 hover:bg-gray-200 transition-all duration-200"
          >
            <div className="flex justify-center w-14">
              <DollarSign className="w-6 h-6 flex-shrink-0" />
            </div>

            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Process Salaries
            </span>
          </Link>
        </RoleGuard>
        {/* Salary Components */}
        <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
          <Link
            to="/admin/salary-components"
            className="flex items-center w-full px-3 py-3 hover:bg-gray-200 transition-all duration-200"
          >
            <div className="flex justify-center w-14">
              <Settings className="w-6 h-6 flex-shrink-0" />
            </div>
            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Salary Components
            </span>
          </Link>
        </RoleGuard>

        {/* Statutory Config */}
        <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
          <Link
            to="/admin/statutory-templates"
            className="flex items-center w-full px-3 py-3 hover:bg-gray-200 transition-all duration-200"
          >
            <div className="flex justify-center w-14">
              <Settings className="w-6 h-6 flex-shrink-0" />
            </div>
            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Statutory Config
            </span>
          </Link>
        </RoleGuard>
        {/* 👇 ADD THIS */}
        <RoleGuard roles={['HR_ADMIN', 'SUPER_ADMIN']}>
          <Link
            to="/admin/bulk-salary-processing"
            className="flex items-center w-full px-3 py-3 hover:bg-gray-200 transition-all duration-200"
          >
            <div className="flex justify-center w-14">
              <DollarSign className="w-6 h-6 flex-shrink-0" />
            </div>
            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Process Salaries
            </span>
          </Link>
        </RoleGuard>

        {/* Super Admin only */}
        <RoleGuard roles={['SUPER_ADMIN']}>
          <Link
            to="/admin/config"
            className="flex items-center w-full px-3 py-3 hover:bg-gray-200 transition-all duration-200"
          >
            <div className="flex justify-center w-14">
              <Settings className="w-6 h-6 flex-shrink-0" />
            </div>

            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Settings
            </span>
          </Link>
        </RoleGuard>
      </div>

    </div>
  );
};

export default Sidebar;
