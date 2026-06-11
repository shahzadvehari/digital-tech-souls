import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.setting.findMany();
  }

  findOne(key: string) {
    return this.prisma.setting.findUnique({ where: { key } });
  }

  upsert(key: string, value: string, description?: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }
}
