import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma.module';
import { CurrencyModule } from '../currency/currency.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, CurrencyModule, MailModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
