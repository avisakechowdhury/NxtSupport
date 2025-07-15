import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Layouts
import AppLayout from '../components/Layout/AppLayout';
import PersonalLayout from '../components/Layout/PersonalLayout';

// Pages
import AccountTypeSelection from '../pages/AccountTypeSelection';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PersonalRegister from '../pages/PersonalRegister';
import Dashboard from '../pages/Dashboard';
import TicketsAll from '../pages/TicketsAll';
import TicketsNew from '../pages/TicketsNew';
import TicketsEscalated from '../pages/TicketsEscalated';
import TicketView from '../pages/TicketView';
import ManualTicket from '../pages/ManualTicket';
import EmailSetup from '../pages/EmailSetup';
// import ComplaintCategories from '../pages/ComplaintCategories';
import CustomerPortal from '../pages/CustomerPortal';
import Analytics from '../pages/Analytics';
import AdvancedAnalyticsDashboard from '../pages/AdvancedAnalyticsDashboard';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import Team from '../pages/Team';
import EmailDetail from '../pages/EmailDetail';

// Personal Pages
import PersonalDashboard from '../pages/personal/PersonalDashboard';
import PersonalInbox from '../pages/personal/PersonalInbox';
import PersonalAnalytics from '../pages/personal/PersonalAnalytics';
import PersonalSettings from '../pages/personal/PersonalSettings';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  accountType?: 'business' | 'personal';
}

const ProtectedRoute = ({ isAuthenticated, accountType }: ProtectedRouteProps) => {
  const { user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user's account type matches the required type
  if (accountType && user?.accountType !== accountType) {
    if (user?.accountType === 'personal') {
      return <Navigate to="/personal/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <Outlet />;
};

// Logout component
const LogoutPage = () => {
  const { logout } = useAuthStore();
  
  React.useEffect(() => {
    logout();
  }, [logout]);
  
  return <Navigate to="/" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated, user, fetchCurrentUser, isLoading } = useAuthStore();
  
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!isAuthenticated ? <AccountTypeSelection /> : <Navigate to={user?.accountType === 'personal' ? "/personal/dashboard" : "/dashboard"} replace />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={user?.accountType === 'personal' ? "/personal/dashboard" : "/dashboard"} replace />} />
        <Route path="/register/business" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register/personal" element={!isAuthenticated ? <PersonalRegister /> : <Navigate to="/personal/dashboard" replace />} />
        <Route path="/ticket/:token" element={<CustomerPortal />} />
        
        {/* Logout Route */}
        <Route path="/logout" element={<LogoutPage />} />
        
        {/* Business Routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} accountType="business" />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tickets/all" element={<TicketsAll />} />
            <Route path="/tickets/new" element={<TicketsNew />} />
            <Route path="/tickets/escalated" element={<TicketsEscalated />} />
            <Route path="/tickets/manual" element={<ManualTicket />} />
            <Route path="/tickets/:id" element={<TicketView />} />
            <Route path="/email-setup" element={<EmailSetup />} />
            <Route path="/email/:id" element={<EmailDetail />} />
            {/* <Route path="/complaint-categories" element={<ComplaintCategories />} /> */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/advanced-analytics" element={<AdvancedAnalyticsDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/team" element={<Team />} />
          </Route>
        </Route>
        
        {/* Personal Routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} accountType="personal" />}>
          <Route element={<PersonalLayout />}>
            <Route path="/personal/dashboard" element={<PersonalDashboard />} />
            <Route path="/personal/inbox" element={<PersonalInbox />} />
            <Route path="/personal/analytics" element={<PersonalAnalytics />} />
            <Route path="/personal/settings" element={<PersonalSettings />} />
            <Route path="/personal/profile" element={<Profile />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to={isAuthenticated ? (user?.accountType === 'personal' ? "/personal/dashboard" : "/dashboard") : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;