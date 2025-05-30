import React from 'react';
import { TicketsLineChart, TicketsPriorityChart } from '../components/Analytics/TicketsChart';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-5">Analytics</h2>
        <p className="text-neutral-500 mb-5">
          Visualize and analyze your support ticket data
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
                    Change
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
                    89%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600">
                    +3.2%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                      Good
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    Average Response Confidence
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    83%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-warning-600">
                    -1.5%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-100 text-warning-800">
                      Needs Improvement
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    Escalation Rate
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    12%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600">
                    -2.1%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                      Good
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    Response Generation Time
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    3.2 seconds
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600">
                    -0.4s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                      Excellent
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;