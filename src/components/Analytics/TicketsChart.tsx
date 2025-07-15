import React from 'react';
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

interface ChartProps {
  dateRange?: '7d' | '30d' | '90d' | '1y';
  height?: number;
}

const TicketsLineChart: React.FC<ChartProps> = ({ dateRange = '30d', height = 300 }) => {
  const { tickets } = useTicketStore();
  
  // Generate data for the specified date range
  const generateTicketsByDay = () => {
    const days = [];
    const counts = [];
    const resolvedCounts = [];
    
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
      
      const dayTickets = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return isWithinInterval(ticketDate, { start: dayStart, end: dayEnd });
      });
      
      const dayResolved = tickets.filter(ticket => {
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

  const { days, counts, resolvedCounts } = generateTicketsByDay();
  
  const data: ChartData<'line'> = {
    labels: days,
    datasets: [
      {
        label: 'New Tickets',
        data: counts,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Resolved Tickets',
        data: resolvedCounts,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
      }
    ],
  };
  
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Ticket Volume Trend (Last ${dateRange === '7d' ? '7 Days' : dateRange === '30d' ? '30 Days' : dateRange === '90d' ? '90 Days' : '1 Year'})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={data} options={options} />
    </div>
  );
};

const TicketsPriorityChart: React.FC<ChartProps> = ({ height = 300 }) => {
  const { tickets } = useTicketStore();
  
  const priorityCounts = {
    low: tickets.filter(t => t.priority === 'low').length,
    medium: tickets.filter(t => t.priority === 'medium').length,
    high: tickets.filter(t => t.priority === 'high').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length
  };
  
  const data: ChartData<'bar'> = {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [
      {
        label: 'Tickets by Priority',
        data: [
          priorityCounts.low,
          priorityCounts.medium,
          priorityCounts.high,
          priorityCounts.urgent
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
        borderWidth: 2,
      }
    ],
  };
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Tickets by Priority',
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

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={data} options={options} />
    </div>
  );
};

const TicketsStatusChart: React.FC<ChartProps> = ({ height = 300 }) => {
  const { tickets } = useTicketStore();
  
  const statusCounts = {
    new: tickets.filter(t => t.status === 'new').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    escalated: tickets.filter(t => t.status === 'escalated').length
  };
  
  const data: ChartData<'doughnut'> = {
    labels: ['New', 'In Progress', 'Resolved', 'Escalated'],
    datasets: [{
      data: [
        statusCounts.new,
        statusCounts.in_progress,
        statusCounts.resolved,
        statusCounts.escalated
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
      borderWidth: 2,
      hoverOffset: 4,
    }]
  };
  
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Tickets by Status',
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

const TicketsResolutionTimeChart: React.FC<ChartProps> = ({ dateRange = '30d', height = 300 }) => {
  const { tickets } = useTicketStore();
  
  // Filter tickets by date range
  const endDate = new Date();
  const startDate = subDays(endDate, 
    dateRange === '7d' ? 7 : 
    dateRange === '30d' ? 30 : 
    dateRange === '90d' ? 90 : 365
  );

  const filteredTickets = tickets.filter(ticket => {
    const ticketDate = new Date(ticket.createdAt);
    return isWithinInterval(ticketDate, { start: startDate, end: endDate });
  });

  // Calculate resolution time buckets
  const resolutionTimeBuckets = {
    '0-4h': 0,
    '4-8h': 0,
    '8-24h': 0,
    '24-48h': 0,
    '48h+': 0
  };

  filteredTickets.forEach(ticket => {
    if (ticket.resolvedAt && ticket.createdAt) {
      const resolutionTime = new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime();
      const hours = resolutionTime / (1000 * 60 * 60);
      
      if (hours <= 4) resolutionTimeBuckets['0-4h']++;
      else if (hours <= 8) resolutionTimeBuckets['4-8h']++;
      else if (hours <= 24) resolutionTimeBuckets['8-24h']++;
      else if (hours <= 48) resolutionTimeBuckets['24-48h']++;
      else resolutionTimeBuckets['48h+']++;
    }
  });
  
  const data: ChartData<'bar'> = {
    labels: Object.keys(resolutionTimeBuckets),
    datasets: [{
      label: 'Resolution Time Distribution',
      data: Object.values(resolutionTimeBuckets),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(249, 115, 22)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2,
    }]
  };
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Resolution Time Distribution',
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

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={data} options={options} />
    </div>
  );
};

const TicketsAIPerformanceChart: React.FC<ChartProps> = ({ height = 300 }) => {
  const { tickets } = useTicketStore();
  
  // Calculate AI performance metrics
  const totalTickets = tickets.length;
  const aiConfidenceBuckets = {
    '90-100%': 0,
    '80-89%': 0,
    '70-79%': 0,
    '60-69%': 0,
    '<60%': 0
  };

  tickets.forEach(ticket => {
    const confidence = ticket.aiConfidence || 0;
    if (confidence >= 0.9) aiConfidenceBuckets['90-100%']++;
    else if (confidence >= 0.8) aiConfidenceBuckets['80-89%']++;
    else if (confidence >= 0.7) aiConfidenceBuckets['70-79%']++;
    else if (confidence >= 0.6) aiConfidenceBuckets['60-69%']++;
    else aiConfidenceBuckets['<60%']++;
  });
  
  const data: ChartData<'polarArea'> = {
    labels: Object.keys(aiConfidenceBuckets),
    datasets: [{
      label: 'AI Confidence Distribution',
      data: Object.values(aiConfidenceBuckets),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(245, 158, 11)',
        'rgb(249, 115, 22)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2,
    }]
  };
  
  const options: ChartOptions<'polarArea'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'AI Confidence Distribution',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <PolarArea data={data} options={options} />
    </div>
  );
};

export {
  TicketsLineChart,
  TicketsPriorityChart,
  TicketsStatusChart,
  TicketsResolutionTimeChart,
  TicketsAIPerformanceChart
};