import { DashboardStats } from '../types';

export const mockDashboardStats: DashboardStats = {
  totalTickets: 42,
  newTickets: 8,
  respondedTickets: 17,
  escalatedTickets: 3,
  resolvedTickets: 14,
  averageResponseTime: 4.2, // hours
  ticketsByPriority: {
    low: 9,
    medium: 15,
    high: 13,
    urgent: 5
  },
  ticketsByDay: [
    { date: '2023-05-31', count: 4 },
    { date: '2023-06-01', count: 6 },
    { date: '2023-06-02', count: 8 },
    { date: '2023-06-03', count: 4 },
    { date: '2023-06-04', count: 7 },
    { date: '2023-06-05', count: 5 },
    { date: '2023-06-06', count: 8 }
  ]
};

export const getGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
};

export const mockTicketsGrowth = {
  total: getGrowthRate(42, 35),
  new: getGrowthRate(8, 5),
  responded: getGrowthRate(17, 14),
  escalated: getGrowthRate(3, 2),
  resolved: getGrowthRate(14, 10)
};