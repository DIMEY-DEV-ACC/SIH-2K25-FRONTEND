import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Building,
  User,
  CreditCard,
  FileText,
  UserCheck,
  UserPlus,
  Home,
  Bed,
  MapPin,
  Library,
  BookMarked,
  Award,
  Shield,
  Phone,
  X
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import Button from '../ui/Button';

const iconMap = {
  LayoutDashboard,
  Users,
  BookOpen,
  Building,
  User,
  CreditCard,
  FileText,
  UserCheck,
  UserPlus,
  Home,
  Bed,
  MapPin,
  Library,
  BookMarked,
  Award,
  Shield,
  Phone
};

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/students', label: 'Students', icon: 'Users' },
  { path: '/courses', label: 'Courses', icon: 'BookOpen' },
  { path: '/departments', label: 'Departments', icon: 'Building' },
  { path: '/users', label: 'Users', icon: 'User' },
  { path: '/fees', label: 'Fees', icon: 'CreditCard' },
  { path: '/exams', label: 'Exams', icon: 'FileText' },
  { path: '/guardians', label: 'Guardians', icon: 'UserCheck' },
  { path: '/admissions', label: 'Admissions', icon: 'UserPlus' },
  { path: '/hostels', label: 'Hostels', icon: 'Home' },
  { path: '/rooms', label: 'Rooms', icon: 'Bed' },
  { path: '/hostel-allocations', label: 'Hostel Allocations', icon: 'MapPin' },
  { path: '/library', label: 'Library', icon: 'Library' },
  { path: '/book-issues', label: 'Book Issues', icon: 'BookMarked' },
  { path: '/results', label: 'Results', icon: 'Award' },
  { path: '/user-roles', label: 'User Roles', icon: 'Shield' },
  { path: '/contact-details', label: 'Contact Details', icon: 'Phone' }
];

const Sidebar = () => {
  const { state, actions } = useAppContext();
  const { sidebarOpen } = state;
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={actions.toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ERP</span>
              </div>
              <span className="font-semibold text-gray-900">SIH ERP</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={actions.toggleSidebar}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = iconMap[item.icon];
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      active
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => {
                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        actions.toggleSidebar();
                      }
                    }}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${active ? 'text-primary-500' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              SIH ERP System v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;