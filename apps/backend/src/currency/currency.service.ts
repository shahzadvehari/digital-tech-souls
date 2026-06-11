import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(private prisma: PrismaService) {}

  async getAllCurrencies() {
    return this.prisma.currency.findMany({
      orderBy: { isBase: 'desc' }
    });
  }

  async syncAutoRates() {
    const autoCurrencies = await this.prisma.currency.findMany({
      where: { mode: 'AUTO', isBase: false }
    });

    if (autoCurrencies.length === 0) return { message: 'No auto currencies to sync' };

    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) throw new Error('API down');
      const data = await response.json();

      for (const curr of autoCurrencies) {
        if (data.rates[curr.code]) {
          await this.prisma.currency.update({
            where: { id: curr.id },
            data: { rate: data.rates[curr.code] }
          });
        }
      }
      return { message: 'Sync complete' };
    } catch (error) {
      this.logger.error('Failed to sync auto rates', error);
      return { error: 'Failed to sync' };
    }
  }

  async addCurrency(data: { code: string; symbol: string; rate: number; mode: string }) {
    return this.prisma.currency.create({
      data: {
        code: data.code.toUpperCase(),
        symbol: data.symbol,
        rate: data.rate,
        mode: data.mode
      }
    });
  }

  async updateCurrency(id: number, data: any) {
    return this.prisma.currency.update({
      where: { id },
      data
    });
  }

  async removeCurrency(id: number) {
    return this.prisma.currency.delete({
      where: { id }
    });
  }

  // Backward compatibility for OrdersService before full frontend refactor
  async getExchangeRate(code: string = 'PKR') {
    const curr = await this.prisma.currency.findUnique({ where: { code } });
    if (curr) {
      return { currency: curr.code, rate: curr.rate, mode: curr.mode };
    }
    // fallback if missing
    return { currency: 'PKR', rate: 278.50, mode: 'manual' };
  }
}
