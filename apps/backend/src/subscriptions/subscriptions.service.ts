import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async findMySubscriptions(userId: number) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAll() {
    return this.prisma.subscription.findMany({
      include: {
        user: {
          select: { email: true, username: true }
        },
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: { userId: number; planId?: number; status?: string; currentPeriodEnd?: Date; stripeSubId?: string }) {
    return this.prisma.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: data.status || 'ACTIVE',
        currentPeriodEnd: data.currentPeriodEnd,
        stripeSubId: data.stripeSubId
      },
      include: { user: true, plan: true }
    });
  }

  async update(id: number, data: { planId?: number; status?: string; currentPeriodEnd?: Date; stripeSubId?: string }) {
    return this.prisma.subscription.update({
      where: { id },
      data,
      include: { user: true, plan: true }
    });
  }

  async remove(id: number) {
    return this.prisma.subscription.delete({
      where: { id }
    });
  }
}
