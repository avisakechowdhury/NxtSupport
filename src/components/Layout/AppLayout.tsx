import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../../store/authStore';

const AppLayout = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null; // This will be handled by the protected route
  }

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="h-full flex">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMobileMenuToggle={handleMobileMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;