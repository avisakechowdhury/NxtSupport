import React, { useState, useEffect } from 'react';
import { Bell, Settings, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { user, logout, company } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close menus when clicking outside
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
    <>
      <header className="bg-white border-b border-neutral-200 py-3 px-4 flex items-center justify-between relative z-40">
        {/* Left side - Mobile menu button and company name */}
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
          
          <h1 className="text-lg font-medium text-neutral-800">
            {company?.name || 'AI Email Support'}
          </h1>
        </div>

        {/* Right side - Desktop: notifications, settings, user menu | Mobile: only user menu */}
        <div className="flex items-center space-x-2">
          {/* Desktop notifications and settings - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-neutral-100 relative">
              <Bell className="h-5 w-5 text-neutral-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>
            
            <Link 
              to="/settings"
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
              <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
                
                {/* Mobile-only menu items */}
                <div className="md:hidden">
                  <Link 
                    to="/settings" 
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
                </div>
                
                <Link 
                  to="/profile" 
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
    </>
  );
};

export default Header;