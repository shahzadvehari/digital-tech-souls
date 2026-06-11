import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClientLogosService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string, iconName?: string }) {
    return this.prisma.clientLogo.create({ data });
  }

  findAll() {
    return this.prisma.clientLogo.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.clientLogo.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.clientLogo.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.clientLogo.delete({ where: { id } });
  }
}
