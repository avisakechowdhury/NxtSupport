import React, { useState, useEffect } from 'react';
import { Bell, Settings, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const { user, logout, company } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu || showNotifications || showSettings) {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-container')) {
          setShowUserMenu(false);
          setShowNotifications(false);
          setShowSettings(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showNotifications, showSettings]);

  return (
    <header className="bg-white border-b border-neutral-200 py-3 px-4 flex items-center justify-between">
      {/* Company name */}
      <h1 className="text-lg font-medium text-neutral-800 hidden sm:block">
        {company?.name || 'AI Email Support'}
      </h1>

      {/* Right side buttons */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <div className="menu-container relative">
          <button 
            className="p-2 rounded-full hover:bg-neutral-100 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5 text-neutral-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50">
              <div className="p-4 border-b border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {/* Add notification items here */}
                <div className="p-4 text-sm text-neutral-500">
                  No new notifications
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="menu-container relative">
          <button 
            className="p-2 rounded-full hover:bg-neutral-100"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-5 w-5 text-neutral-600" />
          </button>
          
          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
              <div className="py-1">
                <a href="/settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  Account Settings
                </a>
                <a href="/email-setup" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  Email Configuration
                </a>
                <a href="/team" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  Team Management
                </a>
              </div>
            </div>
          )}
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
              <a href="/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                Profile
              </a>
              <button 
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-neutral-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;