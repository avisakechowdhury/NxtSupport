import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { user, logout, company } = useAuthStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    startPolling,
    stopPolling,
    clearAllNotifications
  } = useNotificationStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [clearing, setClearing] = useState(false);
  const notificationListRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showNotifications && !target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showNotifications]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    if (notification.relatedTicketId && notification.relatedTicketId._id) {
      navigate(`/tickets/${notification.relatedTicketId._id}`);
    }
    setShowNotifications(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleClearAll = async () => {
    setClearing(true);
    setTimeout(async () => {
      await clearAllNotifications();
      setClearing(false);
    }, 400);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const handleMobileMenuToggle = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur border-b border-neutral-200 shadow-sm px-6 py-3 flex items-center justify-between md:static">
      {/* Left: Company Name */}
      <div className="flex items-center">
        <button
          className="md:hidden p-2 rounded-md hover:bg-neutral-100 mr-1"
          onClick={handleMobileMenuToggle}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-neutral-600" />
          ) : (
            <Menu className="h-6 w-6 text-neutral-600" />
          )}
        </button>
        <span className="font-bold text-lg text-primary-700 tracking-tight">
          {company?.name || 'NxtSupport'}
        </span>
      </div>

      {/* Right: Icons & User */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <div className="notifications-container relative">
          <button
            className="p-2 rounded-full hover:bg-neutral-100 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5 text-neutral-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute top-full mt-2 shadow-lg bg-white rounded-lg py-1 z-50 border border-neutral-200 max-h-[60vh] overflow-y-auto
                            left-0 right-0 w-screen max-w-none mx-[-1.5rem]
                            sm:left-auto sm:right-0 sm:w-80 sm:max-w-xs sm:mx-0">
              <div className="px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <span className="text-xs text-primary-600">{unreadCount} new</span>
                  )}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary-600 hover:text-primary-800"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-error-500 hover:text-error-700 ml-2"
                      title="Clear all notifications"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              <div
                ref={notificationListRef}
                className={`transition-opacity duration-400 ${clearing ? 'opacity-0' : 'opacity-100'}`}
              >
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-neutral-500">
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-b-0 ${
                        !notification.isRead ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start flex-1">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                            <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteNotification(e, notification._id)}
                          className="ml-2 p-1 rounded hover:bg-neutral-200 flex-shrink-0"
                        >
                          <span className="sr-only">Delete</span>
                          <svg className="h-4 w-4 text-error-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* Settings */}
        <button
          className="hidden md:inline-flex p-2 rounded-full hover:bg-neutral-100"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-5 w-5 text-neutral-600" />
        </button>
        {/* User avatar and dropdown */}
        <div className="relative user-menu-container">
          <button
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-neutral-100"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="h-8 w-8 bg-primary-200 text-primary-700 rounded-full flex items-center justify-center font-bold uppercase">
              {user?.name ? user.name[0] : 'U'}
            </span>
            <span
              className="hidden md:inline text-sm font-medium text-neutral-700 cursor-pointer hover:underline"
              onClick={e => { e.stopPropagation(); navigate('/profile'); }}
            >
              {user?.name || 'User'}
            </span>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-neutral-200">
              <Link to="/profile" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100">Profile</Link>
              <Link to="/settings" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100">Settings</Link>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-error-600 hover:bg-neutral-100 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;