import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.digitalProduct.findMany();
  }

  async findOne(id: number) {
    return this.prisma.digitalProduct.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.digitalProduct.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.digitalProduct.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.digitalProduct.delete({ where: { id } });
  }
}
