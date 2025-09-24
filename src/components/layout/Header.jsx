import React from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import Button from '../ui/Button';
import SearchBar from '../ui/SearchBar';

const Header = () => {
  const { state, actions } = useAppContext();
  const { sidebarOpen } = state;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={actions.toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-900">
              SIH ERP System
            </h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-lg mx-4">
          <SearchBar
            placeholder="Search across all modules..."
            className="w-full"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 px-3"
            >
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;