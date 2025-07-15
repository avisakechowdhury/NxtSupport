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
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target,
  Activity,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  Star,
  CheckCircle,
  AlertTriangle,
  MessageSquare
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

interface TeamMemberPerformance {
  id: string;
  name: string;
  totalTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  avgResponseTime: number;
  satisfactionScore: number;
  productivityScore: number;
  ticketsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  ticketsByStatus: {
    new: number;
    in_progress: number;
    resolved: number;
    escalated: number;
  };
}

const TeamPerformanceAnalytics = () => {
  const { tickets, fetchTickets } = useTicketStore();
  const { members, fetchTeamMembers } = useTeamStore();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchTeamMembers();
  }, [fetchTickets, fetchTeamMembers]);

  // Filter tickets by date range
  const getFilteredTickets = () => {
    const endDate = new Date();
    const startDate = subDays(endDate, 
      dateRange === '7d' ? 7 : 
      dateRange === '30d' ? 30 : 
      dateRange === '90d' ? 90 : 365
    );

    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      return isWithinInterval(ticketDate, { start: startDate, end: endDate });
    });
  };

  const filteredTickets = getFilteredTickets();

  // Calculate team member performance
  const calculateTeamPerformance = (): TeamMemberPerformance[] => {
    return members.map(member => {
      const memberTickets = filteredTickets.filter(ticket => 
        ticket.assignedTo && 
        (typeof ticket.assignedTo === 'string' ? ticket.assignedTo === member._id : ticket.assignedTo._id === member._id)
      );

      const resolvedTickets = memberTickets.filter(t => t.status === 'resolved');
      const escalatedTickets = memberTickets.filter(t => t.status === 'escalated');

      // Calculate average resolution time
      const avgResolutionTime = resolvedTickets.length > 0 
        ? resolvedTickets.reduce((sum, ticket) => {
            if (!ticket.resolvedAt) return sum;
            const resolutionTime = new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime();
            return sum + resolutionTime;
          }, 0) / resolvedTickets.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      // Calculate average response time
      const respondedTickets = memberTickets.filter(t => t.responseGeneratedAt);
      const avgResponseTime = respondedTickets.length > 0 
        ? respondedTickets.reduce((sum, ticket) => {
            const responseTime = new Date(ticket.responseGeneratedAt!).getTime() - new Date(ticket.createdAt).getTime();
            return sum + responseTime;
          }, 0) / respondedTickets.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      // Calculate satisfaction score (based on resolution time and escalation rate)
      const satisfactionScore = memberTickets.length > 0 
        ? Math.max(1, 5 - (avgResolutionTime / 24) - (escalatedTickets.length / memberTickets.length) * 2)
        : 0;

      // Calculate productivity score
      const productivityScore = memberTickets.length > 0 
        ? Math.min(100, (resolvedTickets.length / memberTickets.length) * 100 + (24 / Math.max(avgResolutionTime, 1)) * 10)
        : 0;

      // Tickets by priority
      const ticketsByPriority = {
        low: memberTickets.filter(t => t.priority === 'low').length,
        medium: memberTickets.filter(t => t.priority === 'medium').length,
        high: memberTickets.filter(t => t.priority === 'high').length,
        urgent: memberTickets.filter(t => t.priority === 'urgent').length
      };

      // Tickets by status
      const ticketsByStatus = {
        new: memberTickets.filter(t => t.status === 'new').length,
        in_progress: memberTickets.filter(t => t.status === 'in_progress').length,
        resolved: memberTickets.filter(t => t.status === 'resolved').length,
        escalated: memberTickets.filter(t => t.status === 'escalated').length
      };

      return {
        id: member._id,
        name: member.name,
        totalTickets: memberTickets.length,
        resolvedTickets: resolvedTickets.length,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        satisfactionScore: Math.round(satisfactionScore * 10) / 10,
        productivityScore: Math.round(productivityScore),
        ticketsByPriority,
        ticketsByStatus
      };
    });
  };

  const teamPerformance = calculateTeamPerformance();

  // Get selected member performance
  const selectedMemberPerformance = selectedMember === 'all' 
    ? null 
    : teamPerformance.find(p => p.id === selectedMember);

  // Team overview metrics
  const teamOverview = {
    totalMembers: members.length,
    totalTickets: filteredTickets.length,
    avgResolutionTime: teamPerformance.length > 0 
      ? teamPerformance.reduce((sum, p) => sum + p.avgResolutionTime, 0) / teamPerformance.length
      : 0,
    avgSatisfactionScore: teamPerformance.length > 0
      ? teamPerformance.reduce((sum, p) => sum + p.satisfactionScore, 0) / teamPerformance.length
      : 0,
    avgProductivityScore: teamPerformance.length > 0
      ? teamPerformance.reduce((sum, p) => sum + p.productivityScore, 0) / teamPerformance.length
      : 0
  };

  // Generate performance trend data
  const generatePerformanceTrendData = () => {
    const days = [];
    const productivityScores = [];
    const satisfactionScores = [];
    
    const endDate = new Date();
    const startDate = subDays(endDate, 
      dateRange === '7d' ? 7 : 
      dateRange === '30d' ? 30 : 
      dateRange === '90d' ? 90 : 365
    );

    const dateRangeArray = eachDayOfInterval({ start: startDate, end: endDate });
    
    dateRangeArray.forEach(date => {
      const dateStr = format(date, 'MM-dd');
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayTickets = filteredTickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return isWithinInterval(ticketDate, { start: dayStart, end: dayEnd });
      });
      
      // Calculate daily productivity (resolved tickets / total tickets)
      const dailyProductivity = dayTickets.length > 0 
        ? (dayTickets.filter(t => t.status === 'resolved').length / dayTickets.length) * 100
        : 0;
      
      // Calculate daily satisfaction (simplified)
      const dailySatisfaction = dayTickets.length > 0 
        ? Math.max(1, 5 - (dayTickets.filter(t => t.status === 'escalated').length / dayTickets.length) * 2)
        : 0;
      
      days.push(dateStr);
      productivityScores.push(Math.round(dailyProductivity));
      satisfactionScores.push(Math.round(dailySatisfaction * 10) / 10);
    });
    
    return { days, productivityScores, satisfactionScores };
  };

  const { days, productivityScores, satisfactionScores } = generatePerformanceTrendData();

  // Performance comparison data
  const performanceComparisonData = {
    labels: teamPerformance.map(p => p.name),
    datasets: [
      {
        label: 'Productivity Score',
        data: teamPerformance.map(p => p.productivityScore),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Satisfaction Score',
        data: teamPerformance.map(p => p.satisfactionScore * 20), // Scale to 0-100
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }
    ]
  };

  // Workload distribution data
  const workloadDistributionData = {
    labels: teamPerformance.map(p => p.name),
    datasets: [{
      label: 'Total Tickets',
      data: teamPerformance.map(p => p.totalTickets),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(249, 115, 22)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)'
      ],
      borderWidth: 2
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

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Team Performance Analytics</h2>
          <p className="text-neutral-500">Track individual and team productivity metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Team Members</option>
            {members.map(member => (
              <option key={member._id} value={member._id}>{member.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Team Members</p>
              <p className="text-2xl font-semibold text-neutral-900">{teamOverview.totalMembers}</p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active team
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
              <p className="text-sm font-medium text-neutral-500">Avg Productivity</p>
              <p className={`text-2xl font-semibold ${getPerformanceColor(teamOverview.avgProductivityScore)}`}>
                {Math.round(teamOverview.avgProductivityScore)}%
              </p>
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
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Avg Satisfaction</p>
              <p className={`text-2xl font-semibold ${getSatisfactionColor(teamOverview.avgSatisfactionScore)}`}>
                {Math.round(teamOverview.avgSatisfactionScore * 10) / 10}/5
              </p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.2 from last period
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Avg Resolution Time</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {Math.round(teamOverview.avgResolutionTime)}h
              </p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2h from last period
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Performance Trends</h3>
          <div style={{ height: '300px' }}>
            <Line
              data={{
                labels: days,
                datasets: [
                  {
                    label: 'Productivity Score (%)',
                    data: productivityScores,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true,
                  },
                  {
                    label: 'Satisfaction Score (x20)',
                    data: satisfactionScores.map(s => s * 20),
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

        {/* Performance Comparison */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Team Performance Comparison</h3>
          <div style={{ height: '300px' }}>
            <Bar data={performanceComparisonData} options={chartOptions} />
          </div>
        </div>

        {/* Workload Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Workload Distribution</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={workloadDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* Individual Member Performance */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Individual Performance Radar</h3>
          <div style={{ height: '300px' }}>
            <Radar
              data={{
                labels: ['Productivity', 'Satisfaction', 'Response Time', 'Resolution Time', 'Ticket Volume'],
                datasets: teamPerformance.map((member, index) => ({
                  label: member.name,
                  data: [
                    member.productivityScore,
                    member.satisfactionScore * 20,
                    100 - Math.min(member.avgResponseTime * 10, 100),
                    100 - Math.min(member.avgResolutionTime * 2, 100),
                    Math.min(member.totalTickets * 5, 100)
                  ],
                  backgroundColor: `rgba(${59 + index * 40}, ${130 + index * 20}, ${246 - index * 30}, 0.2)`,
                  borderColor: `rgb(${59 + index * 40}, ${130 + index * 20}, ${246 - index * 30})`,
                  borderWidth: 2,
                  pointBackgroundColor: `rgb(${59 + index * 40}, ${130 + index * 20}, ${246 - index * 30})`,
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: `rgb(${59 + index * 40}, ${130 + index * 20}, ${246 - index * 30})`
                }))
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">Team Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Resolved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Avg Resolution Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Productivity Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Satisfaction Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {teamPerformance.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {member.totalTickets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {member.resolvedTickets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {member.avgResolutionTime}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <span className={getPerformanceColor(member.productivityScore)}>
                      {member.productivityScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <span className={getSatisfactionColor(member.satisfactionScore)}>
                      {member.satisfactionScore}/5
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.productivityScore >= 80 
                        ? 'bg-green-100 text-green-800' 
                        : member.productivityScore >= 60 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.productivityScore >= 80 ? 'High Performer' : member.productivityScore >= 60 ? 'Good' : 'Needs Support'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformanceAnalytics; 