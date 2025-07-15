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
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import { useTicketStore } from '../../store/ticketStore';
import { 
  Heart, 
  Star, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Users,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  Smile,
  Frown,
  Meh
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

interface CustomerSatisfactionMetrics {
  overallSatisfaction: number;
  responseTimeSatisfaction: number;
  resolutionSatisfaction: number;
  communicationSatisfaction: number;
  npsScore: number;
  customerEffortScore: number;
  repeatCustomers: number;
  customerRetentionRate: number;
}

const CustomerSatisfactionAnalytics = () => {
  const { tickets, fetchTickets } = useTicketStore();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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

  // Calculate customer satisfaction metrics (simulated data for now)
  const calculateSatisfactionMetrics = (): CustomerSatisfactionMetrics => {
    const totalTickets = filteredTickets.length;
    if (totalTickets === 0) {
      return {
        overallSatisfaction: 0,
        responseTimeSatisfaction: 0,
        resolutionSatisfaction: 0,
        communicationSatisfaction: 0,
        npsScore: 0,
        customerEffortScore: 0,
        repeatCustomers: 0,
        customerRetentionRate: 0
      };
    }

    // Simulate satisfaction scores based on ticket characteristics
    const resolvedTickets = filteredTickets.filter(t => t.status === 'resolved');
    const escalatedTickets = filteredTickets.filter(t => t.status === 'escalated');
    
    // Calculate satisfaction based on response time
    const responseTimeSatisfaction = resolvedTickets.reduce((sum, ticket) => {
      if (!ticket.responseGeneratedAt) return sum + 3; // Neutral if no response
      const responseTime = new Date(ticket.responseGeneratedAt).getTime() - new Date(ticket.createdAt).getTime();
      const hours = responseTime / (1000 * 60 * 60);
      
      if (hours <= 2) return sum + 5; // Excellent
      if (hours <= 4) return sum + 4; // Good
      if (hours <= 8) return sum + 3; // Neutral
      if (hours <= 24) return sum + 2; // Poor
      return sum + 1; // Very poor
    }, 0) / resolvedTickets.length;

    // Calculate satisfaction based on resolution time
    const resolutionSatisfaction = resolvedTickets.reduce((sum, ticket) => {
      if (!ticket.resolvedAt) return sum + 3;
      const resolutionTime = new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime();
      const hours = resolutionTime / (1000 * 60 * 60);
      
      if (hours <= 24) return sum + 5;
      if (hours <= 48) return sum + 4;
      if (hours <= 72) return sum + 3;
      if (hours <= 120) return sum + 2;
      return sum + 1;
    }, 0) / resolvedTickets.length;

    // Calculate communication satisfaction (based on number of interactions)
    const communicationSatisfaction = resolvedTickets.reduce((sum, ticket) => {
      const activities = ticket.activities?.length || 0;
      if (activities >= 3) return sum + 5; // Good communication
      if (activities >= 2) return sum + 4;
      if (activities >= 1) return sum + 3;
      return sum + 2; // Poor communication
    }, 0) / resolvedTickets.length;

    // Overall satisfaction (weighted average)
    const overallSatisfaction = (
      responseTimeSatisfaction * 0.4 + 
      resolutionSatisfaction * 0.4 + 
      communicationSatisfaction * 0.2
    );

    // NPS Score calculation (Net Promoter Score)
    const promoters = resolvedTickets.filter(t => {
      const satisfaction = calculateTicketSatisfaction(t);
      return satisfaction >= 4;
    }).length;
    
    const detractors = resolvedTickets.filter(t => {
      const satisfaction = calculateTicketSatisfaction(t);
      return satisfaction <= 2;
    }).length;

    const npsScore = totalTickets > 0 ? ((promoters - detractors) / totalTickets) * 100 : 0;

    // Customer Effort Score (1-7 scale, lower is better)
    const customerEffortScore = resolvedTickets.reduce((sum, ticket) => {
      const resolutionTime = ticket.resolvedAt ? 
        (new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60) : 0;
      
      if (resolutionTime <= 4) return sum + 2; // Very easy
      if (resolutionTime <= 8) return sum + 3; // Easy
      if (resolutionTime <= 24) return sum + 4; // Neutral
      if (resolutionTime <= 48) return sum + 5; // Difficult
      if (resolutionTime <= 72) return sum + 6; // Very difficult
      return sum + 7; // Extremely difficult
    }, 0) / resolvedTickets.length;

    // Repeat customers (simulated)
    const uniqueCustomers = new Set(filteredTickets.map(t => t.customerEmail)).size;
    const repeatCustomers = Math.floor(uniqueCustomers * 0.3); // 30% repeat rate

    // Customer retention rate
    const customerRetentionRate = totalTickets > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

    return {
      overallSatisfaction: Math.round(overallSatisfaction * 10) / 10,
      responseTimeSatisfaction: Math.round(responseTimeSatisfaction * 10) / 10,
      resolutionSatisfaction: Math.round(resolutionSatisfaction * 10) / 10,
      communicationSatisfaction: Math.round(communicationSatisfaction * 10) / 10,
      npsScore: Math.round(npsScore),
      customerEffortScore: Math.round(customerEffortScore * 10) / 10,
      repeatCustomers,
      customerRetentionRate: Math.round(customerRetentionRate * 10) / 10
    };
  };

  const calculateTicketSatisfaction = (ticket: any) => {
    if (!ticket.resolvedAt) return 3;
    
    const resolutionTime = new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime();
    const hours = resolutionTime / (1000 * 60 * 60);
    
    if (hours <= 4) return 5;
    if (hours <= 8) return 4;
    if (hours <= 24) return 3;
    if (hours <= 48) return 2;
    return 1;
  };

  const metrics = calculateSatisfactionMetrics();

  // Generate satisfaction trend data
  const generateSatisfactionTrendData = () => {
    const days = [];
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
      
      const avgSatisfaction = dayTickets.length > 0 
        ? dayTickets.reduce((sum, ticket) => sum + calculateTicketSatisfaction(ticket), 0) / dayTickets.length
        : 0;
      
      days.push(dateStr);
      satisfactionScores.push(Math.round(avgSatisfaction * 10) / 10);
    });
    
    return { days, satisfactionScores };
  };

  const { days, satisfactionScores } = generateSatisfactionTrendData();

  // Satisfaction distribution data
  const satisfactionDistributionData = {
    labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
    datasets: [{
      data: [
        filteredTickets.filter(t => calculateTicketSatisfaction(t) === 1).length,
        filteredTickets.filter(t => calculateTicketSatisfaction(t) === 2).length,
        filteredTickets.filter(t => calculateTicketSatisfaction(t) === 3).length,
        filteredTickets.filter(t => calculateTicketSatisfaction(t) === 4).length,
        filteredTickets.filter(t => calculateTicketSatisfaction(t) === 5).length
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(156, 163, 175, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(249, 115, 22)',
        'rgb(156, 163, 175)',
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)'
      ],
      borderWidth: 2
    }]
  };

  // NPS breakdown data
  const npsBreakdownData = {
    labels: ['Detractors (0-6)', 'Passives (7-8)', 'Promoters (9-10)'],
    datasets: [{
      data: [
        filteredTickets.filter(t => calculateTicketSatisfaction(t) <= 2).length,
        filteredTickets.filter(t => calculateTicketSatisfaction(t) === 3).length,
        filteredTickets.filter(t => calculateTicketSatisfaction(t) >= 4).length
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(156, 163, 175, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(156, 163, 175)',
        'rgb(34, 197, 94)'
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
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    if (score >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-green-600';
    if (score >= 30) return 'text-blue-600';
    if (score >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Customer Satisfaction Analytics</h2>
          <p className="text-neutral-500">Track and improve customer experience metrics</p>
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
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Overall Satisfaction</p>
              <p className={`text-2xl font-semibold ${getSatisfactionColor(metrics.overallSatisfaction)}`}>
                {metrics.overallSatisfaction}/5
              </p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.3 from last period
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">NPS Score</p>
              <p className={`text-2xl font-semibold ${getNPSColor(metrics.npsScore)}`}>
                {metrics.npsScore}
              </p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5 from last period
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
              <p className="text-sm font-medium text-neutral-500">Customer Effort Score</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {metrics.customerEffortScore}/7
              </p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -0.5 from last period
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Retention Rate</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {metrics.customerRetentionRate}%
              </p>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2% from last period
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satisfaction Trend */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Satisfaction Trend</h3>
          <div style={{ height: '300px' }}>
            <Line
              data={{
                labels: days,
                datasets: [
                  {
                    label: 'Average Satisfaction Score',
                    data: satisfactionScores,
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

        {/* Satisfaction Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Satisfaction Distribution</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={satisfactionDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* NPS Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">NPS Breakdown</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={npsBreakdownData} options={chartOptions} />
          </div>
        </div>

        {/* Customer Journey Satisfaction */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Journey Satisfaction</h3>
          <div style={{ height: '300px' }}>
            <Bar
              data={{
                labels: ['Response Time', 'Resolution Time', 'Communication', 'Overall'],
                datasets: [{
                  label: 'Satisfaction Score',
                  data: [
                    metrics.responseTimeSatisfaction,
                    metrics.resolutionSatisfaction,
                    metrics.communicationSatisfaction,
                    metrics.overallSatisfaction
                  ],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                  ],
                  borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(34, 197, 94)',
                    'rgb(249, 115, 22)',
                    'rgb(139, 92, 246)'
                  ],
                  borderWidth: 2
                }]
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">Customer Experience Metrics</h3>
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
                  Overall Satisfaction Score
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {metrics.overallSatisfaction}/5
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  ≥ 4.5
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.overallSatisfaction >= 4.5 
                      ? 'bg-green-100 text-green-800' 
                      : metrics.overallSatisfaction >= 4.0 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metrics.overallSatisfaction >= 4.5 ? 'Excellent' : metrics.overallSatisfaction >= 4.0 ? 'Good' : 'Needs Improvement'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  Net Promoter Score (NPS)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {metrics.npsScore}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  ≥ 50
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.npsScore >= 50 
                      ? 'bg-green-100 text-green-800' 
                      : metrics.npsScore >= 30 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metrics.npsScore >= 50 ? 'Excellent' : metrics.npsScore >= 30 ? 'Good' : 'Needs Improvement'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  Customer Effort Score
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {metrics.customerEffortScore}/7
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  ≤ 3
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.customerEffortScore <= 3 
                      ? 'bg-green-100 text-green-800' 
                      : metrics.customerEffortScore <= 4 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metrics.customerEffortScore <= 3 ? 'Excellent' : metrics.customerEffortScore <= 4 ? 'Good' : 'Needs Improvement'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  Customer Retention Rate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {metrics.customerRetentionRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  ≥ 80%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.customerRetentionRate >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : metrics.customerRetentionRate >= 60 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metrics.customerRetentionRate >= 80 ? 'Excellent' : metrics.customerRetentionRate >= 60 ? 'Good' : 'Needs Improvement'}
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

export default CustomerSatisfactionAnalytics; 