import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.service.create({ data });
  }

  findAll() {
    return this.prisma.service.findMany();
  }

  findOne(id: number) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.service.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.service.delete({ where: { id } });
  }
}
