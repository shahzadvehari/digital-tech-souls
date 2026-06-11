import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackVisit(data: { path: string; ipAddress?: string; userAgent?: string; country?: string }) {
    return this.prisma.siteVisit.create({
      data: {
        path: data.path,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        country: data.country
      }
    });
  }

  async getStats() {
    // 1. Active Users (unique IPs in last 5 mins)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsersVisits = await this.prisma.siteVisit.findMany({
      where: { createdAt: { gte: fiveMinsAgo } },
      select: { ipAddress: true }
    });
    const activeUsers = new Set(activeUsersVisits.map(v => v.ipAddress)).size;

    // 2. All visits for aggregation
    const allVisits = await this.prisma.siteVisit.findMany();
    
    // Group by month for chart (format: "Jan", "Feb")
    const monthlyMap: Record<string, { visitors: Set<string>, pageViews: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 7 months
    const currentMonth = new Date().getMonth();
    for(let i=6; i>=0; i--) {
      let m = currentMonth - i;
      if(m < 0) m += 12;
      monthlyMap[months[m]] = { visitors: new Set(), pageViews: 0 };
    }

    // Group by Region
    const regionMap: Record<string, number> = {};

    allVisits.forEach(v => {
      const d = new Date(v.createdAt);
      const mStr = months[d.getMonth()];
      if (monthlyMap[mStr]) {
        monthlyMap[mStr].pageViews++;
        if (v.ipAddress) monthlyMap[mStr].visitors.add(v.ipAddress);
      }

      const region = v.country || 'Unknown';
      regionMap[region] = (regionMap[region] || 0) + 1;
    });

    const monthlyData = Object.keys(monthlyMap).map(k => ({
      name: k,
      visitors: monthlyMap[k].visitors.size,
      pageViews: monthlyMap[k].pageViews
    }));

    const regionData = Object.keys(regionMap).map(k => ({
      name: k,
      value: regionMap[k]
    })).sort((a, b) => b.value - a.value);

    // Calculate this month's total visitors for the summary card
    const thisMonthStr = months[currentMonth];
    const monthlyVisitors = monthlyMap[thisMonthStr] ? monthlyMap[thisMonthStr].visitors.size : 0;

    // Financial Metrics
    const activeSubs = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true }
    });
    const mrr = activeSubs.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0);

    const paidOrders = await this.prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    });
    const totalSales = paidOrders._sum.totalAmount || 0;

    const ticketsResolved = await this.prisma.ticket.count({
      where: { status: 'CLOSED' }
    });
    
    const activeTickets = await this.prisma.ticket.count({
      where: { status: 'OPEN' }
    });

    return {
      activeUsers,
      monthlyVisitors,
      monthlyData,
      regionData,
      mrr,
      totalSales,
      ticketsResolved,
      activeTickets
    };
  }
}
