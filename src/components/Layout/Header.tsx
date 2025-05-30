import React, { useState } from 'react';
import { Bell, Settings, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const { user, logout, company } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-white border-b border-neutral-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          className="md:hidden text-neutral-500 hover:text-neutral-700 mr-4"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-medium text-neutral-800 hidden sm:block">
          {company?.name || 'AI Email Support'}
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-full hover:bg-neutral-100 relative">
          <Bell size={20} className="text-neutral-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>
        
        <button className="p-2 rounded-full hover:bg-neutral-100">
          <Settings size={20} className="text-neutral-600" />
        </button>
        
        <div className="relative">
          <button 
            className="flex items-center space-x-2 hover:bg-neutral-100 rounded-full p-1 pl-2"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="text-sm font-medium text-neutral-700 mr-1 hidden sm:block">
              {user?.name || 'User'}
            </span>
            <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center">
              <User size={16} />
            </div>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 animate-fade-in">
              <div className="px-4 py-2 border-b border-neutral-200">
                <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
              </div>
              <a href="#" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center">
                <User size={16} className="mr-2" />
                Profile
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center">
                <Settings size={16} className="mr-2" />
                Settings
              </a>
              <button 
                className="w-full text-left block px-4 py-2 text-sm text-error-600 hover:bg-neutral-100 flex items-center"
                onClick={logout}
              >
                <LogOut size={16} className="mr-2" />
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