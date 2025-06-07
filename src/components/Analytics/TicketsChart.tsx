import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useTicketStore } from '../../store/ticketStore';
import { format, subDays, startOfDay } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TicketsLineChart = () => {
  const { tickets } = useTicketStore();
  
  // Generate data for the last 7 days
  const generateTicketsByDay = () => {
    const days = [];
    const counts = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'MM-dd');
      const count = tickets.filter(ticket => {
        const ticketDate = startOfDay(new Date(ticket.createdAt));
        return ticketDate.getTime() === date.getTime();
      }).length;
      
      days.push(dateStr);
      counts.push(count);
    }
    
    return { days, counts };
  };

  const { days, counts } = generateTicketsByDay();
  
  const data: ChartData<'line'> = {
    labels: days,
    datasets: [
      {
        label: 'Tickets',
        data: counts,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
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
        text: 'Tickets by Day',
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
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

const TicketsPriorityChart = () => {
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
          'rgba(156, 163, 175, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [
          'rgb(156, 163, 175)',
          'rgb(59, 130, 246)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 1,
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
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export { TicketsLineChart, TicketsPriorityChart };