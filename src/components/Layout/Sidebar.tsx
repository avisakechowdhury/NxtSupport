import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Tags
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMediaQuery } from 'react-responsive';
// import ComplaintCategoriesIcon from '../Icons/ComplaintCategoriesIcon';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, onMobileMenuClose }) => {
  const { user } = useAuthStore();
  const [openMenus, setOpenMenus] = useState<string[]>(['tickets']);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const toggleMenu = (menu: string) => {
    if (openMenus.includes(menu)) {
      setOpenMenus(openMenus.filter(m => m !== menu));
    } else {
      setOpenMenus([...openMenus, menu]);
    }
  };

  const isAdmin = user?.role === 'admin';

  const handleNavClick = () => {
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  // Sidebar classes for mobile responsiveness
  const sidebarClasses = `overflow-x-hidden ${
    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
  } md:translate-x-0 fixed md:static inset-y-0 left-0 ${collapsed ? 'w-16' : 'w-64'} bg-neutral-900 text-neutral-100 transform transition-transform duration-200 ease-in-out md:transform-none z-60 top-16 md:top-0`;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed left-0 right-0 bottom-0 top-16 bg-black bg-opacity-50 z-60"
          onClick={onMobileMenuClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Collapse/Expand button always at the top */}
        <div className="flex items-center justify-end p-2 border-b border-neutral-800">
          <button
            className="p-1 rounded-md hover:bg-neutral-800"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        {/* Logo and (if expanded) app name - only show on desktop */}
        <div className="p-5 flex items-center md:flex hidden">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className={`h-8 w-8${collapsed ? ' mx-auto' : ' mr-3'}`}
            style={{ display: collapsed ? 'block' : undefined }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <Mail className={`h-6 w-6 text-primary-400${collapsed ? ' mx-auto' : ' hidden'}`} />
          {!collapsed && <h1 className="text-xl font-semibold ml-2">Auxigent</h1>}
        </div>
        
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/dashboard" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-primary-700 text-white' 
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`
                }
                title={collapsed ? 'Dashboard' : undefined}
              >
                <LayoutDashboard className="h-5 w-5 mr-0" />
                {!collapsed && <span className="ml-3">Dashboard</span>}
              </NavLink>
            </li>
            
            <li className="mt-4">
              {!collapsed && (
                <div className="px-5 mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Ticket Management
                  </h3>
                </div>
              )}
              
              <div>
                <button
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 rounded-sm mx-2`}
                  onClick={() => {
                    navigate('/tickets/all');
                    if (isMobile && onMobileMenuClose) onMobileMenuClose();
                    if (!collapsed && !isMobile) toggleMenu('tickets');
                  }}
                  title={collapsed ? 'Tickets' : undefined}
                >
                  <div className="flex items-center">
                    <TicketCheck className="h-5 w-5 mr-0" />
                    {!collapsed && <span className="ml-3">Tickets</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform ${openMenus.includes('tickets') ? 'transform rotate-180' : ''}`} 
                    />
                  )}
                </button>
                
                {/* Submenu only if not collapsed */}
                {!collapsed && openMenus.includes('tickets') && (
                  <ul className="mt-1 pl-10">
                    <li>
                      <NavLink 
                        to="/tickets/all" 
                        onClick={handleNavClick}
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
                        onClick={handleNavClick}
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
                        onClick={handleNavClick}
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
                    <li>
                      <NavLink 
                        to="/tickets/manual" 
                        onClick={handleNavClick}
                        className={({ isActive }) => 
                          `block py-2 text-sm ${
                            isActive 
                              ? 'text-primary-400 font-medium' 
                              : 'text-neutral-400 hover:text-neutral-200'
                          }`
                        }
                      >
                        <div className="flex items-center">
                          <Plus className="h-3 w-3 mr-1" />
                          Manual Ticket
                        </div>
                      </NavLink>
                    </li>
                  </ul>
                )}
              </div>
            </li>
            
            <li>
              <NavLink 
                to="/email-setup" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-primary-700 text-white' 
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`
                }
                title={collapsed ? 'Email Setup' : undefined}
              >
                <Mail className="h-5 w-5 mr-0" />
                {!collapsed && <span className="ml-3">Email Setup</span>}
              </NavLink>
            </li>
            
            {/* <li>
              <NavLink 
                to="/complaint-categories" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-primary-700 text-white' 
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`
                }
                title={collapsed ? 'Complaint Categories' : undefined}
              >
                <ComplaintCategoriesIcon className="h-5 w-5 mr-0" />
                {!collapsed && <span className="ml-3">Complaint Categories</span>}
              </NavLink>
            </li> */}
            
            <li>
              <NavLink 
                to="/analytics" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                    isActive 
                      ? 'bg-primary-700 text-white' 
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`
                }
                title={collapsed ? 'Analytics' : undefined}
              >
                <BarChart className="h-5 w-5 mr-0" />
                {!collapsed && <span className="ml-3">Analytics</span>}
              </NavLink>
            </li>
            
            {isAdmin && (
              <>
                <li className="mt-4">
                  {!collapsed && (
                    <div className="px-5 mb-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Administration
                      </h3>
                    </div>
                  )}
                </li>
                
                <li>
                  <NavLink 
                    to="/team" 
                    onClick={handleNavClick}
                    className={({ isActive }) => 
                      `flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                        isActive 
                          ? 'bg-primary-700 text-white' 
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`
                    }
                    title={collapsed ? 'Team Members' : undefined}
                  >
                    <Users className="h-5 w-5 mr-0" />
                    {!collapsed && <span className="ml-3">Team Members</span>}
                  </NavLink>
                </li>
                
                <li>
                  <NavLink 
                    to="/settings" 
                    onClick={handleNavClick}
                    className={({ isActive }) => 
                      `flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2.5 text-sm font-medium rounded-sm mx-2 ${
                        isActive 
                          ? 'bg-primary-700 text-white' 
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`
                    }
                    title={collapsed ? 'Settings' : undefined}
                  >
                    <Settings className="h-5 w-5 mr-0" />
                    {!collapsed && <span className="ml-3">Settings</span>}
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        {/* Only show user info box if not collapsed */}
        {!collapsed && (
          <div className="p-4 bg-neutral-800">
            <div
              className={`flex items-center cursor-pointer hover:bg-neutral-700 rounded-md p-2 transition`}
              onClick={() => navigate('/profile')}
              title="View Profile"
            >
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
        )}
      </aside>
    </>
  );
};

export default Sidebar;