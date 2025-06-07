import React, { useEffect } from 'react';
import { TicketsLineChart, TicketsPriorityChart } from '../components/Analytics/TicketsChart';
import { useTicketStore } from '../store/ticketStore';

const Analytics = () => {
  const { tickets, fetchTickets } = useTicketStore();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Calculate real-time AI performance metrics
  const calculateAIMetrics = () => {
    const totalTickets = tickets.length;
    if (totalTickets === 0) return { avgConfidence: 0, escalationRate: 0, responseTime: 0 };

    const avgConfidence = tickets.reduce((sum, ticket) => sum + ticket.aiConfidence, 0) / totalTickets;
    const escalatedTickets = tickets.filter(t => t.status === 'escalated').length;
    const escalationRate = (escalatedTickets / totalTickets) * 100;
    
    const respondedTickets = tickets.filter(t => t.responseGeneratedAt);
    const avgResponseTime = respondedTickets.length > 0 
      ? respondedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const responded = new Date(ticket.responseGeneratedAt!).getTime();
          return sum + (responded - created);
        }, 0) / respondedTickets.length / 1000 // Convert to seconds
      : 0;

    return {
      avgConfidence: Math.round(avgConfidence * 100),
      escalationRate: Math.round(escalationRate * 10) / 10,
      responseTime: Math.round(avgResponseTime * 10) / 10
    };
  };

  const aiMetrics = calculateAIMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-5">Analytics</h2>
        <p className="text-neutral-500 mb-5">
          Visualize and analyze your support ticket data in real-time
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-card rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Ticket Volume Trend</h3>
            <TicketsLineChart />
          </div>
        </div>
        
        <div className="bg-white shadow-card rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Tickets by Priority</h3>
            <TicketsPriorityChart />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-card rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">AI Performance Metrics</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    Average Classification Confidence
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {aiMetrics.avgConfidence}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      aiMetrics.avgConfidence >= 85 
                        ? 'bg-success-100 text-success-800' 
                        : aiMetrics.avgConfidence >= 70 
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {aiMetrics.avgConfidence >= 85 ? 'Excellent' : aiMetrics.avgConfidence >= 70 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    Escalation Rate
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {aiMetrics.escalationRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      aiMetrics.escalationRate <= 10 
                        ? 'bg-success-100 text-success-800' 
                        : aiMetrics.escalationRate <= 20 
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {aiMetrics.escalationRate <= 10 ? 'Excellent' : aiMetrics.escalationRate <= 20 ? 'Good' : 'High'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    Average Response Generation Time
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {aiMetrics.responseTime} seconds
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      aiMetrics.responseTime <= 5 
                        ? 'bg-success-100 text-success-800' 
                        : aiMetrics.responseTime <= 10 
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {aiMetrics.responseTime <= 5 ? 'Excellent' : aiMetrics.responseTime <= 10 ? 'Good' : 'Slow'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    Total Tickets Processed
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {tickets.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-semibold">AI</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">AI Accuracy</p>
              <p className="text-2xl font-semibold text-neutral-900">{aiMetrics.avgConfidence}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <span className="text-warning-600 font-semibold">⚡</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Avg Response Time</p>
              <p className="text-2xl font-semibold text-neutral-900">{aiMetrics.responseTime}s</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center">
                <span className="text-success-600 font-semibold">✓</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Resolved Tickets</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-error-100 rounded-lg flex items-center justify-center">
                <span className="text-error-600 font-semibold">↗</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Escalation Rate</p>
              <p className="text-2xl font-semibold text-neutral-900">{aiMetrics.escalationRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;