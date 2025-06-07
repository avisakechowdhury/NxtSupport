import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TicketCheck, 
  AlertCircle, 
  MessageSquare, 
  BarChart, 
  Users, 
  Settings, 
  Mail,
  ChevronDown,
  Menu
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  const [openMenus, setOpenMenus] = useState<string[]>(['tickets']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = (menu: string) => {
    if (openMenus.includes(menu)) {
      setOpenMenus(openMenus.filter(m => m !== menu));
    } else {
      setOpenMenus([...openMenus, menu]);
    }
  };

  const isAdmin = user?.role === 'admin';

  // Add mobile menu toggle handler
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Add mobile menu class
  const sidebarClasses = `${
    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
  } md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-neutral-900 text-neutral-100 transform transition-transform duration-200 ease-in-out md:transform-none`;

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-neutral-900 text-white"
        onClick={toggleMobileMenu}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="p-5 border-b border-neutral-800 flex items-center">
          <Mail className="h-6 w-6 text-primary-400 mr-2" />
          <h1 className="text-xl font-semibold">Responder AI</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `flex items-center px-5 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-primary-700 text-white' 
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`
                }
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </NavLink>
            </li>
            
            <li className="mt-4">
              <div className="px-5 mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Ticket Management
                </h3>
              </div>
              
              <div>
                <button
                  className="w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 rounded-sm mx-2"
                  onClick={() => toggleMenu('tickets')}
                >
                  <div className="flex items-center">
                    <TicketCheck className="h-5 w-5 mr-3" />
                    <span>Tickets</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      openMenus.includes('tickets') ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {openMenus.includes('tickets') && (
                  <ul className="mt-1 pl-10">
                    <li>
                      <NavLink 
                        to="/tickets/all" 
                        className={({ isActive }) => 
                          `block py-2 text-sm ${
                            isActive 
                              ? 'text-primary-400 font-medium' 
                              : 'text-neutral-400 hover:text-neutral-200'
                          }`
                        }
                      >
                        All Tickets
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        to="/tickets/new" 
                        className={({ isActive }) => 
                          `block py-2 text-sm ${
                            isActive 
                              ? 'text-primary-400 font-medium' 
                              : 'text-neutral-400 hover:text-neutral-200'
                          }`
                        }
                      >
                        New
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        to="/tickets/escalated" 
                        className={({ isActive }) => 
                          `block py-2 text-sm ${
                            isActive 
                              ? 'text-primary-400 font-medium' 
                              : 'text-neutral-400 hover:text-neutral-200'
                          }`
                        }
                      >
                        Escalated
                      </NavLink>
                    </li>
                  </ul>
                )}
              </div>
            </li>
            
            <li>
              <NavLink 
                to="/email-setup" 
                className={({ isActive }) => 
                  `flex items-center px-5 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-primary-700 text-white' 
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`
                }
              >
                <Mail className="h-5 w-5 mr-3" />
                Email Setup
              </NavLink>
            </li>
            
            <li>
              <NavLink 
                to="/analytics" 
                className={({ isActive }) => 
                  `flex items-center px-5 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-primary-700 text-white' 
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`
                }
              >
                <BarChart className="h-5 w-5 mr-3" />
                Analytics
              </NavLink>
            </li>
            
            {isAdmin && (
              <>
                <li className="mt-4">
                  <div className="px-5 mb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Administration
                    </h3>
                  </div>
                </li>
                
                <li>
                  <NavLink 
                    to="/team" 
                    className={({ isActive }) => 
                      `flex items-center px-5 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                        isActive 
                          ? 'bg-primary-700 text-white' 
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`
                    }
                  >
                    <Users className="h-5 w-5 mr-3" />
                    Team Members
                  </NavLink>
                </li>
                
                <li>
                  <NavLink 
                    to="/settings" 
                    className={({ isActive }) => 
                      `flex items-center px-5 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                        isActive 
                          ? 'bg-primary-700 text-white' 
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`
                    }
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <div className="p-4 bg-neutral-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-700">
                <span className="text-lg font-medium leading-none text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-neutral-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;