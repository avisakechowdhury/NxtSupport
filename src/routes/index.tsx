import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Layouts
import AppLayout from '../components/Layout/AppLayout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import TicketsAll from '../pages/TicketsAll';
import TicketsNew from '../pages/TicketsNew';
import TicketsEscalated from '../pages/TicketsEscalated';
import TicketView from '../pages/TicketView';
import EmailSetup from '../pages/EmailSetup';
import Analytics from '../pages/Analytics';
import Settings from '../pages/Settings';
import Team from '../pages/Team';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
}

const ProtectedRoute = ({ isAuthenticated }: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

const AppRoutes = () => {
  const { isAuthenticated, fetchCurrentUser } = useAuthStore();
  
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard\" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard\" replace />} />
        
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tickets/all" element={<TicketsAll />} />
            <Route path="/tickets/new" element={<TicketsNew />} />
            <Route path="/tickets/escalated" element={<TicketsEscalated />} />
            <Route path="/tickets/:id" element={<TicketView />} />
            <Route path="/email-setup" element={<EmailSetup />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/team" element={<Team />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;