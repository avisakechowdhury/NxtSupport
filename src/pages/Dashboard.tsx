import React from 'react';
import DashboardStats from '../components/Dashboard/DashboardStats';
import RecentActivity from '../components/Dashboard/RecentActivity';
import { TicketsLineChart } from '../components/Analytics/TicketsChart';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <DashboardStats />
      
      <div className="bg-white shadow-card rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Ticket Volume Trend</h3>
          <TicketsLineChart />
        </div>
      </div>
      
      <RecentActivity />
    </div>
  );
};

export default Dashboard;