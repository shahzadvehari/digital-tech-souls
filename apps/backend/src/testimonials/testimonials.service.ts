import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.testimonial.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.testimonial.create({ data });
  }

  update(id: number, data: any) {
    return this.prisma.testimonial.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.testimonial.delete({ where: { id } });
  }
}
