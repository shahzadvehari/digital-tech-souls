import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(user: any, startDateStr?: string, endDateStr?: string) {
    const dateFilter: any = {};
    if (startDateStr || endDateStr) {
      dateFilter.createdAt = {};
      if (startDateStr) dateFilter.createdAt.gte = new Date(startDateStr);
      if (endDateStr) {
        const end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = end;
      }
    }
    
    let orderWhereClause: any = { ...dateFilter };
    if (user && user.role === 'RESELLER_USER') {
      orderWhereClause = {
        ...dateFilter,
        OR: [
          { affiliateId: user.sub || user.userId },
          { user: { referredById: user.sub || user.userId } }
        ]
      };
    }

    // 1. Total Users
    const totalUsers = await this.prisma.user.count({
      where: { role: 'NORMAL_USER', ...dateFilter }
    });

    // 2. Pending Tickets (Tickets don't strictly follow dateFilter for "pending" logic but we can filter tickets created in this range)
    const pendingTickets = await this.prisma.ticket.count({
      where: { status: 'OPEN', ...dateFilter }
    });

    // 3. New Leads
    const newLeads = await this.prisma.lead.count({
      where: dateFilter
    });

    // 4. Total Revenue (Assuming base currency is tracked. For now, sum of all PAID orders)
    const paidOrders = await this.prisma.order.findMany({
      where: { status: 'PAID', ...orderWhereClause }
    });
    
    // We'll normalize revenue in frontend or backend. Assuming totalAmount is what we want to sum.
    // If order is PKR we might want to convert to USD, but let's just sum it for the dashboard as is (or assume uniform currency).
    let totalRevenue = 0;
    paidOrders.forEach(o => {
      totalRevenue += o.totalAmount;
    });

    const totalSalesCount = paidOrders.length;
    
    let saleWhereClause: any = { ...dateFilter };
    if (user && user.role === 'RESELLER_USER') {
      saleWhereClause.resellerName = user.username || user.email;
    }

    const totalSalesVolume = await this.prisma.sale.aggregate({
      where: saleWhereClause,
      _sum: { saleAmount: true, commissionEarned: true }
    });
    
    const resellerSalesAmount = totalSalesVolume._sum.saleAmount || 0;
    const totalCommissions = totalSalesVolume._sum.commissionEarned || 0;

    // Additional order metrics
    const totalOrdersCount = await this.prisma.order.count({ where: orderWhereClause });
    const pendingOrdersCount = await this.prisma.order.count({ where: { status: 'PENDING', ...orderWhereClause } });
    const completedOrdersCount = await this.prisma.order.count({ where: { status: { in: ['COMPLETED', 'PAID'] }, ...orderWhereClause } });
    const cancelledOrdersCount = await this.prisma.order.count({ where: { status: 'CANCELLED', ...orderWhereClause } });

    // 5. Recent Orders (Last 5)
    const recentOrders = await this.prisma.order.findMany({
      where: orderWhereClause,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true, email: true } },
        items: true
      }
    });

    // 6. Recent Tickets (Last 5 Open)
    const recentTickets = await this.prisma.ticket.findMany({
      where: { status: 'OPEN' },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { username: true, email: true } }
      }
    });

    // 7. Revenue Chart Data (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPaidOrders = await this.prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: thirtyDaysAgo },
        ...(user && user.role === 'RESELLER_USER' ? {
            OR: [
              { affiliateId: user.sub || user.userId },
              { user: { referredById: user.sub || user.userId } }
            ]
        } : {})
      },
      select: {
        createdAt: true,
        totalAmount: true
      }
    });

    // Group by date
    const chartDataMap = new Map<string, number>();
    
    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      chartDataMap.set(dateStr, 0);
    }

    recentPaidOrders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (chartDataMap.has(dateStr)) {
        chartDataMap.set(dateStr, chartDataMap.get(dateStr)! + order.totalAmount);
      }
    });

    const revenueChartData = Array.from(chartDataMap.entries()).map(([date, amount]) => ({
      date, // e.g. "2023-10-01"
      revenue: amount
    }));

    return {
      totalUsers,
      pendingTickets,
      newLeads,
      totalRevenue,
      totalSalesCount,
      resellerSalesAmount,
      totalCommissions,
      totalOrdersCount,
      pendingOrdersCount,
      completedOrdersCount,
      cancelledOrdersCount,
      recentOrders,
      recentTickets,
      revenueChartData
    };
  }
}
