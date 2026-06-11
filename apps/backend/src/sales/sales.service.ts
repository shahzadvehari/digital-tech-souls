import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    // Calculate commission if not explicitly provided
    let commissionEarned = data.commissionEarned;
    if (commissionEarned === undefined) {
      commissionEarned = (data.saleAmount * data.commissionPercentage) / 100;
    }

    return this.prisma.sale.create({
      data: {
        resellerName: data.resellerName,
        productName: data.productName,
        saleAmount: data.saleAmount,
        commissionPercentage: data.commissionPercentage,
        commissionEarned: commissionEarned,
        status: data.status || 'PENDING',
      },
    });
  }

  findAll() {
    return this.prisma.sale.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findByReseller(resellerName: string) {
    return this.prisma.sale.findMany({
      where: { resellerName },
      orderBy: { createdAt: 'desc' }
    });
  }

  update(id: number, data: any) {
    // Recalculate commission if amount or percentage changes
    let commissionEarned = data.commissionEarned;
    if (commissionEarned === undefined && data.saleAmount !== undefined && data.commissionPercentage !== undefined) {
      commissionEarned = (data.saleAmount * data.commissionPercentage) / 100;
      data.commissionEarned = commissionEarned;
    }
    return this.prisma.sale.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.sale.delete({
      where: { id },
    });
  }
}
