import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Company from '../models/Company.js';

const router = express.Router();

// Get comprehensive analytics data
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { dateRange = '30d', teamMember, priority, status } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Build filter query
    const filterQuery = {
      companyId: req.user.companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (teamMember && teamMember !== 'all') {
      filterQuery.assignedTo = teamMember;
    }

    if (priority) {
      filterQuery.priority = priority;
    }

    if (status) {
      filterQuery.status = status;
    }

    // Get tickets
    const tickets = await Ticket.find(filterQuery).populate('assignedTo', 'name email');

    // Calculate metrics
    const totalTickets = tickets.length;
    const newTickets = tickets.filter(t => t.status === 'new').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const escalatedTickets = tickets.filter(t => t.status === 'escalated').length;

    // Response time metrics
    const respondedTickets = tickets.filter(t => t.responseGeneratedAt);
    const avgResponseTime = respondedTickets.length > 0 
      ? respondedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const responded = new Date(ticket.responseGeneratedAt).getTime();
          return sum + (responded - created);
        }, 0) / respondedTickets.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Resolution time metrics
    const resolvedWithTime = tickets.filter(t => t.resolvedAt && t.createdAt);
    const avgResolutionTime = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const resolved = new Date(ticket.resolvedAt).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // AI performance metrics
    const avgConfidence = tickets.reduce((sum, ticket) => sum + (ticket.aiConfidence || 0), 0) / totalTickets;
    const escalationRate = totalTickets > 0 ? (escalatedTickets / totalTickets) * 100 : 0;
    const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

    // Priority distribution
    const priorityDistribution = {
      low: tickets.filter(t => t.priority === 'low').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      high: tickets.filter(t => t.priority === 'high').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length
    };

    // Status distribution
    const statusDistribution = {
      new: newTickets,
      in_progress: inProgressTickets,
      resolved: resolvedTickets,
      escalated: escalatedTickets
    };

    // Daily trend data
    const dailyTrends = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTickets = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return ticketDate >= dayStart && ticketDate <= dayEnd;
      });

      const dayResolved = tickets.filter(ticket => {
        if (!ticket.resolvedAt) return false;
        const resolvedDate = new Date(ticket.resolvedAt);
        return resolvedDate >= dayStart && resolvedDate <= dayEnd;
      });

      dailyTrends.push({
        date: currentDate.toISOString().split('T')[0],
        newTickets: dayTickets.length,
        resolvedTickets: dayResolved.length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      overview: {
        totalTickets,
        newTickets,
        inProgressTickets,
        resolvedTickets,
        escalatedTickets,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        avgConfidence: Math.round(avgConfidence * 100),
        escalationRate: Math.round(escalationRate * 10) / 10,
        resolutionRate: Math.round(resolutionRate * 10) / 10
      },
      distributions: {
        priority: priorityDistribution,
        status: statusDistribution
      },
      trends: dailyTrends
    });

  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get team performance analytics
router.get('/team-performance', authenticateToken, async (req, res) => {
  try {
    const { dateRange = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get team members
    const teamMembers = await User.find({ 
      companyId: req.user.companyId,
      role: { $ne: 'admin' }
    }).select('name email');

    // Get tickets for the period
    const tickets = await Ticket.find({
      companyId: req.user.companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('assignedTo', 'name email');

    // Calculate performance for each team member
    const teamPerformance = teamMembers.map(member => {
      const memberTickets = tickets.filter(ticket => 
        ticket.assignedTo && ticket.assignedTo._id.toString() === member._id.toString()
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
            const responseTime = new Date(ticket.responseGeneratedAt).getTime() - new Date(ticket.createdAt).getTime();
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
        email: member.email,
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

    res.json({ teamPerformance });

  } catch (error) {
    console.error('Error fetching team performance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer satisfaction analytics
router.get('/customer-satisfaction', authenticateToken, async (req, res) => {
  try {
    const { dateRange = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get tickets for the period
    const tickets = await Ticket.find({
      companyId: req.user.companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalTickets = tickets.length;
    if (totalTickets === 0) {
      return res.json({
        satisfaction: {
          overallSatisfaction: 0,
          responseTimeSatisfaction: 0,
          resolutionSatisfaction: 0,
          communicationSatisfaction: 0,
          npsScore: 0,
          customerEffortScore: 0,
          repeatCustomers: 0,
          customerRetentionRate: 0
        },
        trends: [],
        distribution: {}
      });
    }

    const resolvedTickets = tickets.filter(t => t.status === 'resolved');
    const escalatedTickets = tickets.filter(t => t.status === 'escalated');

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
    const uniqueCustomers = new Set(tickets.map(t => t.customerEmail)).size;
    const repeatCustomers = Math.floor(uniqueCustomers * 0.3); // 30% repeat rate

    // Customer retention rate
    const customerRetentionRate = totalTickets > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

    // Satisfaction distribution
    const satisfactionDistribution = {
      'Very Dissatisfied': tickets.filter(t => calculateTicketSatisfaction(t) === 1).length,
      'Dissatisfied': tickets.filter(t => calculateTicketSatisfaction(t) === 2).length,
      'Neutral': tickets.filter(t => calculateTicketSatisfaction(t) === 3).length,
      'Satisfied': tickets.filter(t => calculateTicketSatisfaction(t) === 4).length,
      'Very Satisfied': tickets.filter(t => calculateTicketSatisfaction(t) === 5).length
    };

    // Daily satisfaction trends
    const satisfactionTrends = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTickets = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return ticketDate >= dayStart && ticketDate <= dayEnd;
      });

      const avgSatisfaction = dayTickets.length > 0 
        ? dayTickets.reduce((sum, ticket) => sum + calculateTicketSatisfaction(ticket), 0) / dayTickets.length
        : 0;

      satisfactionTrends.push({
        date: currentDate.toISOString().split('T')[0],
        satisfactionScore: Math.round(avgSatisfaction * 10) / 10
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      satisfaction: {
        overallSatisfaction: Math.round(overallSatisfaction * 10) / 10,
        responseTimeSatisfaction: Math.round(responseTimeSatisfaction * 10) / 10,
        resolutionSatisfaction: Math.round(resolutionSatisfaction * 10) / 10,
        communicationSatisfaction: Math.round(communicationSatisfaction * 10) / 10,
        npsScore: Math.round(npsScore),
        customerEffortScore: Math.round(customerEffortScore * 10) / 10,
        repeatCustomers,
        customerRetentionRate: Math.round(customerRetentionRate * 10) / 10
      },
      trends: satisfactionTrends,
      distribution: satisfactionDistribution
    });

  } catch (error) {
    console.error('Error fetching customer satisfaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to calculate ticket satisfaction
const calculateTicketSatisfaction = (ticket) => {
  if (!ticket.resolvedAt) return 3;
  
  const resolutionTime = new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime();
  const hours = resolutionTime / (1000 * 60 * 60);
  
  if (hours <= 4) return 5;
  if (hours <= 8) return 4;
  if (hours <= 24) return 3;
  if (hours <= 48) return 2;
  return 1;
};

export default router; 