import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { affiliateCode: true, commissionBalance: true, role: true, _count: { select: { referrals: true } } }
    });

    if (!user) {
      throw new BadRequestException('User not found. Please log in again.');
    }

    const recentReferrals = await this.prisma.user.findMany({
      where: { referredById: userId },
      select: { id: true, email: true, createdAt: true },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    const earnings = await this.prisma.order.findMany({
      where: { affiliateId: userId, status: 'PAID' },
      select: { commissionAmount: true, createdAt: true, id: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    let totalEarned = 0;
    const allEarnings = await this.prisma.order.findMany({
      where: { affiliateId: userId, status: 'PAID' },
      select: { commissionAmount: true }
    });
    allEarnings.forEach(e => totalEarned += e.commissionAmount);

    const defaultAffiliateRate = await this.prisma.setting.findUnique({ where: { key: 'affiliate_commission_rate' } });
    const defaultResellerRate = await this.prisma.setting.findUnique({ where: { key: 'reseller_commission_rate' } });
    
    const affiliateRate = parseFloat(defaultAffiliateRate?.value || '10');
    const resellerRate = parseFloat(defaultResellerRate?.value || '20');
    
    const currentRate = user?.role === 'RESELLER_USER' ? resellerRate : affiliateRate;

    return {
      affiliateCode: user?.affiliateCode,
      commissionBalance: user?.commissionBalance,
      totalReferrals: user?._count.referrals,
      totalEarned,
      currentRate,
      role: user?.role,
      recentReferrals,
      recentEarnings: earnings
    };
  }

  async requestWithdrawal(userId: number, amount: number, paymentMethod: string, paymentDetails: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }});
    if (!user) throw new BadRequestException('User not found');
    
    if (amount <= 0 || amount > user.commissionBalance) {
      throw new BadRequestException('Invalid withdrawal amount. Must be greater than 0 and less than or equal to your balance.');
    }

    return this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { commissionBalance: { decrement: amount } }
      }),
      this.prisma.withdrawal.create({
        data: {
          userId,
          amount,
          paymentMethod,
          paymentDetails
        }
      })
    ]);
  }

  async getUserWithdrawals(userId: number) {
    return this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllWithdrawals() {
    return this.prisma.withdrawal.findMany({
      include: { user: { select: { email: true, username: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateWithdrawalStatus(id: number, status: string, adminNote?: string) {
    // If rejecting, we need to refund the user's commission balance
    if (status === 'REJECTED') {
      const withdrawal = await this.prisma.withdrawal.findUnique({ where: { id }});
      if (withdrawal && withdrawal.status === 'PENDING') {
        await this.prisma.$transaction([
          this.prisma.user.update({
            where: { id: withdrawal.userId },
            data: { commissionBalance: { increment: withdrawal.amount } }
          }),
          this.prisma.withdrawal.update({
            where: { id },
            data: { status, adminNote }
          })
        ]);
        return { success: true };
      }
    }

    return this.prisma.withdrawal.update({
      where: { id },
      data: { status, adminNote }
    });
  }

  // --- Full Admin CRUD for Withdrawals ---
  async createAdminWithdrawal(userId: number, amount: number, paymentMethod: string, paymentDetails: string, status: string, adminNote?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }});
    if (!user) throw new BadRequestException('User not found');
    
    // Only decrement balance if status is PENDING or APPROVED
    if (status === 'PENDING' || status === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { commissionBalance: { decrement: amount } }
      });
    }

    return this.prisma.withdrawal.create({
      data: {
        userId,
        amount,
        paymentMethod,
        paymentDetails,
        status,
        adminNote
      },
      include: { user: { select: { email: true, username: true } } }
    });
  }

  async updateAdminWithdrawal(id: number, amount: number, paymentMethod: string, paymentDetails: string, status: string, adminNote?: string) {
    const existing = await this.prisma.withdrawal.findUnique({ where: { id }});
    if (!existing) throw new BadRequestException('Withdrawal not found');

    // Handle balance adjustments if status or amount changes
    if (existing.status !== status || existing.amount !== amount) {
      let balanceAdjustment = 0;
      
      // Revert previous deduction
      if (existing.status === 'PENDING' || existing.status === 'APPROVED') {
        balanceAdjustment += existing.amount;
      }
      
      // Apply new deduction
      if (status === 'PENDING' || status === 'APPROVED') {
        balanceAdjustment -= amount;
      }

      if (balanceAdjustment !== 0) {
        await this.prisma.user.update({
          where: { id: existing.userId },
          data: { commissionBalance: { increment: balanceAdjustment } }
        });
      }
    }

    return this.prisma.withdrawal.update({
      where: { id },
      data: {
        amount,
        paymentMethod,
        paymentDetails,
        status,
        adminNote
      },
      include: { user: { select: { email: true, username: true } } }
    });
  }

  async deleteAdminWithdrawal(id: number) {
    const existing = await this.prisma.withdrawal.findUnique({ where: { id }});
    if (!existing) throw new BadRequestException('Withdrawal not found');

    // Refund if it was pending or approved
    if (existing.status === 'PENDING' || existing.status === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: existing.userId },
        data: { commissionBalance: { increment: existing.amount } }
      });
    }

    return this.prisma.withdrawal.delete({
      where: { id }
    });
  }
}
