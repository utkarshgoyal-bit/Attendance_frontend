import React from 'react';
import Sidebar from './Sidebar';

/**
 * Layout component that wraps pages with the sidebar navigation
 * Provides consistent layout across all authenticated pages
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render
 * @param {boolean} props.fullWidth - If true, don't add sidebar (for login, public pages)
 */
const Layout = ({ children, fullWidth = false }) => {
  // For login and public pages, don't show sidebar
  if (fullWidth) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-64 flex-1">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
