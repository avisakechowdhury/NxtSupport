import React, { useEffect, useState } from 'react';
import { TicketsLineChart, TicketsPriorityChart } from '../components/Analytics/TicketsChart';
import { useTicketStore } from '../store/ticketStore';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Heart, 
  Users, 
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Zap,
  Target,
  Award
} from 'lucide-react';

const Analytics = () => {
  const { tickets, fetchTickets } = useTicketStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Calculate real-time AI performance metrics
  const calculateAIMetrics = () => {
    const totalTickets = tickets.length;
    if (totalTickets === 0) return { avgConfidence: 0, escalationRate: 0, responseTime: 0 };

    const avgConfidence = tickets.reduce((sum, ticket) => sum + (ticket.aiConfidence || 0), 0) / totalTickets;
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

  const analyticsFeatures = [
    {
      title: 'Advanced Business Analytics',
      description: 'Comprehensive business metrics with interactive filters and real-time data',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      link: '/advanced-analytics'
    },
    {
      title: 'Customer Satisfaction Analytics',
      description: 'Track customer experience, NPS scores, and satisfaction trends',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
      link: '/advanced-analytics?tab=customer'
    },
    {
      title: 'Team Performance Analytics',
      description: 'Individual and team productivity metrics with performance insights',
      icon: Users,
      color: 'from-green-500 to-green-600',
      link: '/advanced-analytics?tab=team'
    },
    {
      title: 'AI Performance Metrics',
      description: 'Detailed AI accuracy, response times, and automation efficiency',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      link: '/advanced-analytics?tab=performance'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Analytics</h2>
        <p className="text-neutral-500 mb-6">
          Visualize and analyze your support ticket data in real-time
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Total Tickets</p>
              <p className="text-2xl font-semibold text-neutral-900">{tickets.length}</p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">AI Accuracy</p>
              <p className="text-2xl font-semibold text-neutral-900">{aiMetrics.avgConfidence}%</p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3% from last month
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Avg Response Time</p>
              <p className="text-2xl font-semibold text-neutral-900">{aiMetrics.responseTime}s</p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                -2s from last month
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Resolved Tickets</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% from last month
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Features */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">Advanced Analytics Features</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Explore comprehensive analytics with detailed insights and interactive visualizations
            </p>
          </div>
          <Link
            to="/advanced-analytics"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View All Analytics
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyticsFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                to={feature.link}
                className="group block p-6 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-12 w-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-neutral-900 group-hover:text-primary-600 transition-colors duration-200">
                        {feature.title}
                      </h4>
                      <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary-500 transition-colors duration-200" />
                    </div>
                    <p className="text-sm text-neutral-500 mt-2">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Basic Charts */}
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
      
      {/* AI Performance Metrics Table */}
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
                    AI Confidence Score
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {aiMetrics.avgConfidence}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      aiMetrics.avgConfidence >= 90 
                        ? 'bg-success-100 text-success-800' 
                        : aiMetrics.avgConfidence >= 80 
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {aiMetrics.avgConfidence >= 90 ? 'Excellent' : aiMetrics.avgConfidence >= 80 ? 'Good' : 'Needs Improvement'}
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
    </div>
  );
};

export default Analytics;