import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  // Get all invoices (for Admin)
  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        user: { select: { username: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get invoices for a specific user
  async findByUser(userId: number) {
    return this.prisma.invoice.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Backfill invoices for existing orders
  async backfill() {
    const orders = await this.prisma.order.findMany({
      where: { invoice: null },
      include: { items: true }
    });

    let created = 0;
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const count = await this.prisma.invoice.count();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

      await this.prisma.invoice.create({
        data: {
          invoiceNumber,
          userId: order.userId,
          orderId: order.id,
          subtotal: order.totalAmount,
          totalAmount: order.totalAmount,
          currency: order.currency,
          status: order.status === 'PAID' ? 'PAID' : (order.paymentProof ? 'PENDING_APPROVAL' : 'UNPAID'),
          paymentMethod: order.paymentMethod,
          paymentProof: order.paymentProof,
          dueDate: new Date(order.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
          createdAt: order.createdAt,
          items: {
            create: order.items.map((item: any) => ({
              description: item.productName,
              quantity: 1,
              unitPrice: item.price,
              total: item.price
            }))
          }
        }
      });
      created++;
    }
    return { success: true, count: created };
  }

  // Get a single invoice by ID
  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true, city: true, country: true, phone: true } },
        items: true,
        order: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  // Create an invoice (Admin custom creation)
  async create(data: any) {
    // Generate a unique invoice number
    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: data.userId,
        orderId: data.orderId || null,
        subtotal: data.subtotal,
        taxRate: data.taxRate || 0,
        taxAmount: data.taxAmount || 0,
        discountRate: data.discountRate || 0,
        discountAmount: data.discountAmount || 0,
        totalAmount: data.totalAmount,
        currency: data.currency || 'USD',
        status: data.status || 'UNPAID',
        paymentMethod: data.paymentMethod || null,
        dueDate: new Date(data.dueDate),
        notes: data.notes || null,
        items: {
          create: data.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });
  }

  // Update invoice status (Admin marks as PAID)
  async updateStatus(id: number, status: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: { 
        status,
        paidAt: status === 'PAID' ? new Date() : null 
      },
    });
  }

  // User submit payment proof
  async submitPayment(id: number, paymentMethod: string, paymentProof: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        paymentMethod,
        paymentProof,
        status: 'PENDING_APPROVAL', // Let's use this to indicate user paid but admin needs to verify
      },
    });
  }

  // Update invoice
  async update(id: number, data: any) {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        subtotal: data.subtotal,
        taxRate: data.taxRate,
        discountRate: data.discountRate,
        totalAmount: data.totalAmount,
        currency: data.currency,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      }
    });
  }

  // Resend Invoice Email
  async resendInvoiceEmail(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (!invoice.user?.email) throw new Error('User email not found');
    
    await this.mailService.sendInvoiceEmail(invoice.user.email, invoice.id, invoice.totalAmount, invoice.currency);
    return { success: true, message: 'Invoice resent successfully' };
  }

  // Delete invoice
  async remove(id: number) {
    return this.prisma.invoice.delete({ where: { id } });
  }
}
