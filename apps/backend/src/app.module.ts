import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlansModule } from './plans/plans.module';
import { ServicesModule } from './services/services.module';
import { SettingsModule } from './settings/settings.module';
import { LeadsModule } from './leads/leads.module';
import { PrismaModule } from './prisma.module';
import { ProductsModule } from './products/products.module';
import { BlogModule } from './blog/blog.module';
import { SalesModule } from './sales/sales.module';

import { AuthModule } from './auth/auth.module';
import { ThemesToolsModule } from './themes-tools/themes-tools.module';
import { CurrencyModule } from './currency/currency.module';
import { OrdersModule } from './orders/orders.module';
import { TicketsModule } from './tickets/tickets.module';
import { MailModule } from './mail/mail.module';
import { PaymentsModule } from './payments/payments.module';
import { StatsModule } from './stats/stats.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { VaultModule } from './vault/vault.module';
import { SearchModule } from './search/search.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { ClientLogosModule } from './client-logos/client-logos.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { BackupsModule } from './backups/backups.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // max 100 requests per minute
    }]),
    PrismaModule, AuthModule, PlansModule, ServicesModule, SettingsModule, LeadsModule, ProductsModule, BlogModule, SalesModule, ThemesToolsModule, CurrencyModule, OrdersModule, TicketsModule, MailModule, PaymentsModule, StatsModule, AffiliatesModule, VaultModule, SearchModule, TestimonialsModule, ClientLogosModule, AnalyticsModule, SubscriptionsModule, BackupsModule, InvoicesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
