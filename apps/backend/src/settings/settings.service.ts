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

  async upsertBulk(settings: { key: string; value: string; description?: string }[]) {
    // Perform sequential upserts to avoid SQLite SQLITE_BUSY
    const results = [];
    for (const setting of settings) {
      const res = await this.prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value, description: setting.description },
        create: { key: setting.key, value: setting.value, description: setting.description },
      });
      results.push(res);
    }
    return results;
  }
}
