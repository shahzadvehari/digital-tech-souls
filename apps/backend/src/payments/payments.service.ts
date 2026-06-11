import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrdersService } from '../orders/orders.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService
  ) {}

  private async getStripeConfig() {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          in: ['stripePublicKey', 'stripeSecretKey', 'stripeWebhookSecret']
        }
      }
    });

    const config = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);

    if (!config.stripeSecretKey) {
      throw new BadRequestException('Stripe is not configured on this server.');
    }

    return {
      stripe: new Stripe(config.stripeSecretKey, { apiVersion: '2023-10-16' as any }),
      webhookSecret: config.stripeWebhookSecret
    };
  }

  async createCheckoutSession(orderId: number) {
    const { stripe } = await this.getStripeConfig();

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true }
    });

    if (!order) throw new BadRequestException('Order not found');
    if (order.status === 'PAID') throw new BadRequestException('Order is already paid');

    // Convert items into Stripe line items. 
    // We charge in PKR, but Stripe might require a base currency for some accounts. We'll use order.currency (which is PKR).
    // Note: Stripe expects amounts in the smallest currency unit (e.g. cents for USD). PKR is a zero-decimal currency in Stripe.
    const currency = order.currency.toLowerCase();
    
    // Some currencies are zero-decimal, some are two-decimal. Stripe auto-handles this but we need to pass correctly.
    // Let's just use the order.totalAmount and round it. If it was USD it would be * 100.
    const isZeroDecimal = ['pkr', 'jpy', 'krw'].includes(currency);
    
    const lineItems = order.items.map(item => {
      // Pro-rate the total amount based on items, or just use one line item for the whole order.
      // To prevent rounding errors matching the total, we'll create one line item for the whole order.
      return null; 
    }).filter(x => x !== null);

    // Safer approach: 1 line item for the entire order
    const unitAmount = isZeroDecimal 
      ? Math.round(order.totalAmount) 
      : Math.round(order.totalAmount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Order #${order.id} - Digital Tech Souls`,
              description: order.items.map(i => i.productName).join(', ')
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/dashboard?success=true&order_id=${order.id}`,
      cancel_url: `http://localhost:3000/checkout?cancel=true&order_id=${order.id}`,
      client_reference_id: order.id.toString(),
      customer_email: order.user.email,
    });

    return { url: session.url };
  }

  async createSubscriptionSession(planId: number, userId: number) {
    const { stripe } = await this.getStripeConfig();

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!plan) throw new BadRequestException('Plan not found');
    if (!user) throw new BadRequestException('User not found');
    if (!plan.stripePriceId) throw new BadRequestException('Plan is not configured for Stripe subscriptions');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        }
      ],
      mode: 'subscription',
      success_url: `http://localhost:3000/dashboard?success=true&plan_id=${plan.id}`,
      cancel_url: `http://localhost:3000/plans?cancel=true`,
      client_reference_id: `plan_${plan.id}_user_${user.id}`,
      customer_email: user.email,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const { stripe, webhookSecret } = await this.getStripeConfig();

    let event: any;

    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } else {
        // If webhook secret isn't set, fallback to unsecured parsing (not recommended for prod)
        this.logger.warn('Webhook secret is not configured, bypassing signature verification');
        event = JSON.parse(rawBody.toString('utf8'));
      }
    } catch (err: any) {
      this.logger.error(`Webhook Error: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      if (session.mode === 'payment') {
        const orderId = parseInt(session.client_reference_id || '0', 10);
        if (orderId) {
          this.logger.log(`Payment successful for Order #${orderId}`);
          await this.ordersService.updateStatus(orderId, 'PAID');
        }
      } else if (session.mode === 'subscription') {
        // Handle new subscription
        const ref = session.client_reference_id || '';
        const match = ref.match(/plan_(\d+)_user_(\d+)/);
        if (match) {
          const planId = parseInt(match[1], 10);
          const userId = parseInt(match[2], 10);
          
          await this.prisma.subscription.create({
            data: {
              userId,
              planId,
              stripeCustomerId: session.customer,
              stripeSubId: session.subscription,
              status: 'ACTIVE',
            }
          });
          this.logger.log(`Subscription created for User #${userId} on Plan #${planId}`);
        }
      }
    } else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as any;
      if (invoice.subscription) {
        await this.prisma.subscription.updateMany({
          where: { stripeSubId: invoice.subscription },
          data: { status: 'ACTIVE', currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000) }
        });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as any;
      await this.prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: { status: 'CANCELED' }
      });
    }

    return { received: true };
  }
}
