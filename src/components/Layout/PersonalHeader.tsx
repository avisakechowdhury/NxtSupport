import React, { useState, useEffect } from 'react';
import { Bell, Settings, User, LogOut, Menu, X, Mic } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

interface PersonalHeaderProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const PersonalHeader: React.FC<PersonalHeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { user } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-container')) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleMobileMenuToggle = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 py-3 px-4 flex items-center justify-between relative z-40">
      {/* Left side - Mobile menu button */}
      <div className="flex items-center">
        <button
          className="md:hidden p-2 rounded-md hover:bg-neutral-100 mr-3"
          onClick={handleMobileMenuToggle}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-neutral-600" />
          ) : (
            <Menu className="h-6 w-6 text-neutral-600" />
          )}
        </button>
        
        <div className="hidden md:flex items-center space-x-4">
          <h1 className="text-lg font-medium text-neutral-800">
            Good morning, {user?.name?.split(' ')[0]}!
          </h1>
        </div>
      </div>

      {/* Right side - Actions and user menu */}
      <div className="flex items-center space-x-2">
        {/* Voice Assistant Button */}
        <button className="hidden md:flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
          <Mic className="h-4 w-4 mr-2" />
          Voice Assistant
        </button>

        {/* Desktop notifications and settings - hidden on mobile */}
        <div className="hidden md:flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-neutral-100 relative">
            <Bell className="h-5 w-5 text-neutral-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
          </button>
          
          <Link 
            to="/personal/settings"
            className="p-2 rounded-full hover:bg-neutral-100"
          >
            <Settings className="h-5 w-5 text-neutral-600" />
          </Link>
        </div>

        {/* User menu */}
        <div className="menu-container relative">
          <button 
            className="flex items-center space-x-2 hover:bg-neutral-100 rounded-full p-1 pl-2"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="text-sm font-medium text-neutral-700 mr-1 hidden sm:block">
              {user?.name || 'User'}
            </span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-neutral-200">
                <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
                <p className="text-xs text-purple-600 font-medium">Personal Plan</p>
              </div>
              
              {/* Mobile-only menu items */}
              <div className="md:hidden">
                <Link 
                  to="/personal/settings" 
                  className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
                <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-purple-700 hover:bg-neutral-100">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Assistant
                </button>
              </div>
              
              <Link 
                to="/personal/profile" 
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                onClick={() => setShowUserMenu(false)}
              >
                Profile
              </Link>
              <Link
                to="/logout"
                className="flex items-center w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-neutral-100"
                onClick={() => setShowUserMenu(false)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PersonalHeader;