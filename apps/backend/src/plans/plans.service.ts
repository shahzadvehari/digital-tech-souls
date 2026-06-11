import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '../../prisma/generated/client';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PlanCreateInput) {
    return this.prisma.plan.create({ data });
  }

  async findAll() {
    return this.prisma.plan.findMany();
  }

  async findOne(id: number) {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.PlanUpdateInput) {
    return this.prisma.plan.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.plan.delete({ where: { id } });
  }
}
