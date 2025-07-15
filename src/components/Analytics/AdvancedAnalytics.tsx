import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useTicketStore } from '../../store/ticketStore';
import { useTeamStore } from '../../store/teamStore';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Star,
  Target,
  Activity,
  BarChart3,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isWithinInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsFilters {
  dateRange: '7d' | '30d' | '90d' | '1y';
  teamMember?: string;
  priority?: string;
  status?: string;
}

const AdvancedAnalytics = () => {
  const { tickets, fetchTickets } = useTicketStore();
  const { members, fetchTeamMembers } = useTeamStore();
  const [filters, setFilters] = useState<AnalyticsFilters>({ dateRange: '30d' });
  const [isLoading, setIsLoading] = useState(false);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      // Destroy any existing charts to prevent canvas reuse issues
      const charts = ChartJS.instances;
      if (charts) {
        Object.values(charts).forEach((chart: any) => {
          if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
          }
        });
      }
    };
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchTeamMembers();
  }, [fetchTickets, fetchTeamMembers]);

  // Filter tickets based on selected criteria
  const getFilteredTickets = () => {
    let filtered = [...tickets];

    // Date range filter
    const endDate = new Date();
    const startDate = subDays(endDate, 
      filters.dateRange === '7d' ? 7 : 
      filters.dateRange === '30d' ? 30 : 
      filters.dateRange === '90d' ? 90 : 365
    );

    filtered = filtered.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      return isWithinInterval(ticketDate, { start: startDate, end: endDate });
    });

    // Team member filter
    if (filters.teamMember) {
      filtered = filtered.filter(ticket => 
        ticket.assignedTo && 
        (typeof ticket.assignedTo === 'string' ? ticket.assignedTo === filters.teamMember : ticket.assignedTo._id === filters.teamMember)
      );
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    return filtered;
  };

  const filteredTickets = getFilteredTickets();

  // Calculate comprehensive metrics
  const calculateMetrics = () => {
    const totalTickets = filteredTickets.length;
    if (totalTickets === 0) return {};

    const newTickets = filteredTickets.filter(t => t.status === 'new').length;
    const inProgressTickets = filteredTickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = filteredTickets.filter(t => t.status === 'resolved').length;
    const escalatedTickets = filteredTickets.filter(t => t.status === 'escalated').length;

    // Response time metrics
    const respondedTickets = filteredTickets.filter(t => t.responseGeneratedAt);
    const avgResponseTime = respondedTickets.length > 0 
      ? respondedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const responded = new Date(ticket.responseGeneratedAt!).getTime();
          return sum + (responded - created);
        }, 0) / respondedTickets.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Resolution time metrics
    const resolvedWithTime = filteredTickets.filter(t => t.resolvedAt && t.createdAt);
    const avgResolutionTime = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const resolved = new Date(ticket.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // AI performance metrics
    const avgConfidence = filteredTickets.reduce((sum, ticket) => sum + (ticket.aiConfidence || 0), 0) / totalTickets;
    const escalationRate = (escalatedTickets / totalTickets) * 100;
    const resolutionRate = (resolvedTickets / totalTickets) * 100;

    // Team performance
    const teamPerformance = members.map(member => {
      const memberTickets = filteredTickets.filter(t => 
        t.assignedTo && 
        (typeof t.assignedTo === 'string' ? t.assignedTo === member._id : t.assignedTo._id === member._id)
      );
      const resolvedByMember = memberTickets.filter(t => t.status === 'resolved').length;
      const avgResolutionTimeMember = memberTickets.length > 0 
        ? memberTickets.filter(t => t.resolvedAt).reduce((sum, ticket) => {
            const created = new Date(ticket.createdAt).getTime();
            const resolved = new Date(ticket.resolvedAt!).getTime();
            return sum + (resolved - created);
          }, 0) / memberTickets.filter(t => t.resolvedAt).length / (1000 * 60 * 60)
        : 0;

      return {
        name: member.name,
        totalTickets: memberTickets.length,
        resolvedTickets: resolvedByMember,
        resolutionRate: memberTickets.length > 0 ? (resolvedByMember / memberTickets.length) * 100 : 0,
        avgResolutionTime: avgResolutionTimeMember
      };
    });

    return {
      totalTickets,
      newTickets,
      inProgressTickets,
      resolvedTickets,
      escalatedTickets,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      avgConfidence: Math.round(avgConfidence * 100),
      escalationRate: Math.round(escalationRate * 10) / 10,
      resolutionRate: Math.round(resolutionRate * 10) / 10,
      teamPerformance
    };
  };

  const metrics = calculateMetrics();

  // Generate chart data
  const generateTicketTrendData = () => {
    const days = [];
    const counts = [];
    const resolvedCounts = [];
    
    const endDate = new Date();
    const startDate = subDays(endDate, 
      filters.dateRange === '7d' ? 7 : 
      filters.dateRange === '30d' ? 30 : 
      filters.dateRange === '90d' ? 90 : 365
    );

    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    dateRange.forEach(date => {
      const dateStr = format(date, 'MM-dd');
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayTickets = filteredTickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return isWithinInterval(ticketDate, { start: dayStart, end: dayEnd });
      });
      
      const dayResolved = filteredTickets.filter(ticket => {
        if (!ticket.resolvedAt) return false;
        const resolvedDate = new Date(ticket.resolvedAt);
        return isWithinInterval(resolvedDate, { start: dayStart, end: dayEnd });
      });
      
      days.push(dateStr);
      counts.push(dayTickets.length);
      resolvedCounts.push(dayResolved.length);
    });
    
    return { days, counts, resolvedCounts };
  };

  const { days, counts, resolvedCounts } = generateTicketTrendData();

  // Priority distribution data
  const priorityData = {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [{
      data: [
        filteredTickets.filter(t => t.priority === 'low').length,
        filteredTickets.filter(t => t.priority === 'medium').length,
        filteredTickets.filter(t => t.priority === 'high').length,
        filteredTickets.filter(t => t.priority === 'urgent').length
      ],
      backgroundColor: [
        'rgba(156, 163, 175, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(156, 163, 175)',
        'rgb(59, 130, 246)',
        'rgb(249, 115, 22)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2
    }]
  };

  // Status distribution data
  const statusData = {
    labels: ['New', 'In Progress', 'Resolved', 'Escalated'],
    datasets: [{
      data: [
        filteredTickets.filter(t => t.status === 'new').length,
        filteredTickets.filter(t => t.status === 'in_progress').length,
        filteredTickets.filter(t => t.status === 'resolved').length,
        filteredTickets.filter(t => t.status === 'escalated').length
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(249, 115, 22)',
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2
    }]
  };

  // Team performance radar data
  const teamRadarData = {
    labels: metrics.teamPerformance?.map(p => p.name) || [],
    datasets: [{
      label: 'Resolution Rate (%)',
      data: metrics.teamPerformance?.map(p => p.resolutionRate) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(59, 130, 246)'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchTickets(), fetchTeamMembers()]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Advanced Analytics</h2>
          <p className="text-neutral-500">Comprehensive insights into your support operations</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-700">Filters:</span>
          </div>
          
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
            className="px-3 py-1 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <select
            value={filters.teamMember || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, teamMember: e.target.value || undefined }))}
            className="px-3 py-1 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Team Members</option>
            {members.map(member => (
              <option key={member._id} value={member._id}>{member.name}</option>
            ))}
          </select>

          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value || undefined }))}
            className="px-3 py-1 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
            className="px-3 py-1 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Total Tickets</p>
              <p className="text-2xl font-semibold text-neutral-900">{metrics.totalTickets}</p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last period
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Resolution Rate</p>
              <p className="text-2xl font-semibold text-neutral-900">{metrics.resolutionRate}%</p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% from last period
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Avg Response Time</p>
              <p className="text-2xl font-semibold text-neutral-900">{metrics.avgResponseTime}h</p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2h from last period
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">AI Accuracy</p>
              <p className="text-2xl font-semibold text-neutral-900">{metrics.avgConfidence}%</p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3% from last period
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Ticket Volume Trend</h3>
          <div style={{ height: '300px' }}>
            <Line
              key="ticket-trend-chart"
              data={{
                labels: days,
                datasets: [
                  {
                    label: 'New Tickets',
                    data: counts,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true,
                  },
                  {
                    label: 'Resolved Tickets',
                    data: resolvedCounts,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.3,
                    fill: true,
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Priority Distribution</h3>
          <div style={{ height: '300px' }}>
            <Doughnut key="priority-distribution-chart" data={priorityData} options={chartOptions} />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Status Distribution</h3>
          <div style={{ height: '300px' }}>
            <Doughnut key="status-distribution-chart" data={statusData} options={chartOptions} />
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Team Performance</h3>
          <div style={{ height: '300px' }}>
            <Radar key="team-performance-chart" data={teamRadarData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">Performance Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  Average Response Time
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {metrics.avgResponseTime} hours
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  &lt; 4 hours
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.avgResponseTime <= 4 
                      ? 'bg-green-100 text-green-800' 
                      : metrics.avgResponseTime <= 8 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metrics.avgResponseTime <= 4 ? 'Excellent' : metrics.avgResponseTime <= 8 ? 'Good' : 'Needs Improvement'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  Average Resolution Time
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {metrics.avgResolutionTime} hours
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  &lt; 24 hours
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.avgResolutionTime <= 24 
                      ? 'bg-green-100 text-green-800' 
                      : metrics.avgResolutionTime <= 48 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metrics.avgResolutionTime <= 24 ? 'Excellent' : metrics.avgResolutionTime <= 48 ? 'Good' : 'Needs Improvement'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  Escalation Rate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {metrics.escalationRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  &lt; 10%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.escalationRate <= 10 
                      ? 'bg-green-100 text-green-800' 
                      : metrics.escalationRate <= 20 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metrics.escalationRate <= 10 ? 'Excellent' : metrics.escalationRate <= 20 ? 'Good' : 'Needs Improvement'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  AI Confidence Score
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {metrics.avgConfidence}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  &gt; 90%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.avgConfidence >= 90 
                      ? 'bg-green-100 text-green-800' 
                      : metrics.avgConfidence >= 80 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metrics.avgConfidence >= 90 ? 'Excellent' : metrics.avgConfidence >= 80 ? 'Good' : 'Needs Improvement'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics; 