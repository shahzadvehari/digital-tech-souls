import { Controller, Post, Body, Req, Headers, UseGuards, BadRequestException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(@Body('orderId') orderId: number) {
    if (!orderId) throw new BadRequestException('Order ID is required');
    return this.paymentsService.createCheckoutSession(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Req() req: any, @Body('planId') planId: number) {
    if (!planId) throw new BadRequestException('Plan ID is required');
    return this.paymentsService.createSubscriptionSession(planId, req.user.sub);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string
  ) {
    if (!signature) throw new BadRequestException('Missing stripe-signature header');
    if (!req.rawBody) throw new BadRequestException('Missing raw body');

    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }
}
