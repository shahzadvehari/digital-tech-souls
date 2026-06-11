import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  create(createLeadDto: any) {
    return this.prisma.lead.create({ data: createLeadDto });
  }

  findAll() {
    return this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.lead.findUnique({ where: { id } });
  }

  update(id: number, updateLeadDto: any) {
    return this.prisma.lead.update({ where: { id }, data: updateLeadDto });
  }

  remove(id: number) {
    return this.prisma.lead.delete({ where: { id } });
  }
}
