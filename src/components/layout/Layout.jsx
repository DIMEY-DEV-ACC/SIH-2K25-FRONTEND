import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import NotificationToast from '../ui/NotificationToast';
import Breadcrumbs from '../ui/Breadcrumbs';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header />
        
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            
            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
      
      {/* Global Notifications */}
      <NotificationToast />
    </div>
  );
};

export default Layout;