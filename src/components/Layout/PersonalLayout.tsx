import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PersonalSidebar from './PersonalSidebar';
import PersonalHeader from './PersonalHeader';
import { useAuthStore } from '../../store/authStore';

const PersonalLayout = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="h-full flex bg-neutral-50">
      <PersonalSidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PersonalHeader 
          onMobileMenuToggle={handleMobileMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PersonalLayout;