import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mail, 
  BarChart3, 
  Settings, 
  Sparkles,
  X,
  User,
  Crown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface PersonalSidebarProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const PersonalSidebar: React.FC<PersonalSidebarProps> = ({ isMobileMenuOpen, onMobileMenuClose }) => {
  const { user } = useAuthStore();

  const handleNavClick = () => {
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const sidebarClasses = `${
    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
  } md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-purple-900 to-pink-900 text-white transform transition-transform duration-200 ease-in-out md:transform-none`;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onMobileMenuClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="p-5 border-b border-purple-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">NxtMail</h1>
              <p className="text-xs text-purple-200">Personal</p>
            </div>
          </div>
          <button
            className="md:hidden p-1 rounded-md hover:bg-purple-800"
            onClick={onMobileMenuClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/personal/dashboard" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `flex items-center px-5 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'text-purple-200 hover:bg-white hover:bg-opacity-10'
                  }`
                }
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </NavLink>
            </li>
            
            <li>
              <NavLink 
                to="/personal/inbox" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `flex items-center px-5 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'text-purple-200 hover:bg-white hover:bg-opacity-10'
                  }`
                }
              >
                <Mail className="h-5 w-5 mr-3" />
                Inbox
              </NavLink>
            </li>
            
            <li>
              <NavLink 
                to="/personal/analytics" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `flex items-center px-5 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'text-purple-200 hover:bg-white hover:bg-opacity-10'
                  }`
                }
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Analytics
              </NavLink>
            </li>
            
            <li className="mt-8">
              <div className="px-5 mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                  Account
                </h3>
              </div>
            </li>
            
            <li>
              <NavLink 
                to="/personal/settings" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `flex items-center px-5 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'text-purple-200 hover:bg-white hover:bg-opacity-10'
                  }`
                }
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
        
        {/* Upgrade Banner */}
        <div className="p-4 m-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
          <div className="flex items-center mb-2">
            <Crown className="h-5 w-5 text-white mr-2" />
            <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-white opacity-90 mb-3">
            Get unlimited labels, voice assistant, and advanced analytics
          </p>
          <button className="w-full bg-white text-orange-600 py-2 px-4 rounded-md text-sm font-medium hover:bg-orange-50 transition-colors">
            Upgrade Now
          </button>
        </div>
        
        <div className="p-4 bg-purple-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <span className="text-sm font-medium leading-none text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-purple-200">Personal Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default PersonalSidebar;