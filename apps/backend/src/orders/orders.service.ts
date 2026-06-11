import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { MailService } from '../mail/mail.service';
import { randomUUID } from 'crypto';
const PDFDocument = require('pdfkit');

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private currencyService: CurrencyService,
    private mailService: MailService
  ) {}

  async create(userId: number, data: any) {
    // 1. Get current exchange rate config
    const rateData = await this.currencyService.getExchangeRate();
    const currency = 'PKR'; // Displaying in PKR for now as per requirement
    
    // 2. Calculate Total from the DB to prevent frontend spoofing
    let totalUSD = 0;
    const itemsData = [];
    
    for (const item of data.items) {
      if (item.type === 'THEME' || item.type === 'TOOL') {
        const dbItem = await this.prisma.themeTool.findUnique({ where: { id: item.id } });
        if (!dbItem) throw new BadRequestException(`Item ${item.id} not found`);
        
        totalUSD += (dbItem.price || 0);
        itemsData.push({
          productType: dbItem.type,
          productId: dbItem.id,
          productName: dbItem.name,
          price: dbItem.price || 0
        });
      } else if (item.type === 'LICENSE') {
        const dbItem = await this.prisma.digitalProduct.findUnique({ where: { id: item.id } });
        if (!dbItem) throw new BadRequestException(`License product ${item.id} not found`);
        
        totalUSD += (dbItem.price || 0);
        itemsData.push({
          productType: 'DIGITAL_PRODUCT',
          productId: dbItem.id,
          productName: dbItem.name,
          price: dbItem.price || 0
        });
      } else if (item.type === 'SERVICE') {
        const dbItem = await this.prisma.service.findUnique({ where: { id: item.id } });
        if (!dbItem) throw new BadRequestException(`Service ${item.id} not found`);
        
        totalUSD += (dbItem.price || 0);
        itemsData.push({
          productType: 'SERVICE',
          productId: dbItem.id,
          productName: dbItem.name,
          price: dbItem.price || 0
        });
      }
    }
    
    const finalAmountPKR = totalUSD * rateData.rate;

    // 3. Create Order
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount: finalAmountPKR,
        currency,
        exchangeRate: rateData.rate,
        paymentMethod: data.paymentMethod || 'MANUAL',
        paymentProof: data.paymentProof || null,
        status: 'PENDING',
        items: {
          create: itemsData
        }
      },
      include: {
        items: true
      }
    });

    // 4. Generate Invoice automatically
    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    
    await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        userId,
        orderId: order.id,
        subtotal: finalAmountPKR,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: finalAmountPKR,
        currency: currency,
        status: data.paymentProof ? 'PENDING_APPROVAL' : 'UNPAID',
        paymentMethod: data.paymentMethod || null,
        paymentProof: data.paymentProof || null,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        items: {
          create: itemsData.map(item => ({
            description: item.productName,
            quantity: 1,
            unitPrice: item.price * rateData.rate, // Save item price in selected currency
            total: item.price * rateData.rate
          }))
        }
      }
    });

    return order;
  }

  findAllForUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { 
        items: true,
        user: { select: { email: true, username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: number, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: true, items: true }
    });

    if (!order) throw new NotFoundException('Order not found');

    // Affiliate Commission Logic
    if (status === 'PAID' && order.status !== 'PAID') {
      const user = await this.prisma.user.findUnique({
        where: { id: order.userId }
      });

      let commissionAmount = 0;
      let affiliateId = null;

      if (user && user.referredById) {
        const referrer = await this.prisma.user.findUnique({ where: { id: user.referredById } });
        if (referrer) {
          // Check Eligibility
          const eligibilitySetting = await this.prisma.setting.findUnique({ where: { key: 'affiliate_commission_eligibility' } });
          const eligibility = eligibilitySetting?.value || 'BOTH'; // DIGITAL_SHOP_ONLY, WHMCS_ONLY, BOTH
          
          let isEligible = false;
          if (eligibility === 'BOTH') {
            isEligible = true;
          } else if (eligibility === 'DIGITAL_SHOP_ONLY') {
            isEligible = order.items.some(item => ['THEME', 'TOOL', 'DIGITAL_PRODUCT', 'SERVICE'].includes(item.productType));
          } else if (eligibility === 'WHMCS_ONLY') {
            isEligible = order.items.some(item => ['PLAN'].includes(item.productType));
          }

          if (isEligible) {
            const defaultAffiliateRate = await this.prisma.setting.findUnique({ where: { key: 'affiliate_commission_rate' } });
            const defaultResellerRate = await this.prisma.setting.findUnique({ where: { key: 'reseller_commission_rate' } });
            
            const affiliateRate = parseFloat(defaultAffiliateRate?.value || '10');
            const resellerRate = parseFloat(defaultResellerRate?.value || '20');

            let commissionPercentage = referrer.role === 'RESELLER_USER' ? resellerRate : affiliateRate;
            
            // Override with custom commission rate if set
            if (referrer.customCommissionRate !== null && referrer.customCommissionRate !== undefined) {
              commissionPercentage = referrer.customCommissionRate;
            }

            commissionAmount = (order.totalAmount * commissionPercentage) / 100;
            affiliateId = referrer.id;

            // Update Affiliate Balance
            await this.prisma.user.update({
              where: { id: affiliateId },
              data: { commissionBalance: { increment: commissionAmount } }
            });

            // Record Sale for Admin Board
            await this.prisma.sale.create({
              data: {
                resellerName: referrer.username || referrer.email,
                productName: `Order #${order.id}`,
                saleAmount: order.totalAmount,
                commissionPercentage: commissionPercentage,
                commissionEarned: commissionAmount,
                status: 'PENDING'
              }
            });
          }
        }
      }

      // Update Order Status
      await this.prisma.order.update({
        where: { id },
        data: { 
          status, 
          affiliateId,
          commissionAmount: commissionAmount > 0 ? commissionAmount : 0
        }
      });
      
      // Notify Email for Order Payment
      if (order.user?.email) {
        try {
          const invoiceBuffer = await this.generateInvoice(order.id);
          await this.mailService.sendOrderPaidEmail(order.user.email, order.id, order.totalAmount, order.currency, invoiceBuffer);
        } catch (e) {
          // If invoice fails, send without it
          await this.mailService.sendOrderPaidEmail(order.user.email, order.id, order.totalAmount, order.currency);
        }
      }
      
      // Auto-generate licenses for Themes, Tools, and Digital Products
      for (const item of order.items) {
        if (['THEME', 'TOOL', 'DIGITAL_PRODUCT'].includes(item.productType)) {
          // Check if license already exists to prevent duplicates
          const existingLicense = await this.prisma.license.findUnique({
            where: { orderItemId: item.id }
          });
          
          if (!existingLicense) {
            await this.prisma.license.create({
              data: {
                licenseKey: randomUUID().toUpperCase(),
                orderItemId: item.id,
                userId: order.userId,
                status: 'ACTIVE'
              }
            });
          }
        }
      }
      
      return { success: true, message: 'Status updated, commission distributed, and licenses generated' };
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status }
    });

    return updated;
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.totalAmount !== undefined) updateData.totalAmount = Number(data.totalAmount);
    if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
    if (data.trackingNote !== undefined) updateData.trackingNote = data.trackingNote;

    return this.prisma.order.update({
      where: { id },
      data: updateData
    });
  }

  async remove(id: number) {
    // Delete order items first due to cascade (or let DB handle it if onDelete: Cascade is set)
    // Prisma handles cascade deletes if defined in schema, which we did for OrderItem.
    return this.prisma.order.delete({
      where: { id }
    });
  }

  async generateInvoice(orderId: number): Promise<Buffer> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true }
    });
    
    if (!order) throw new NotFoundException('Order not found');

    // Fetch dynamic invoice settings
    const settings = await this.prisma.setting.findMany();
    const settingsMap = settings.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});

    const companyName = settingsMap.invoiceCompanyName || 'DIGITAL TECH SOULS';
    const companyAddress = settingsMap.invoiceCompanyAddress || 'Vehari, Punjab, Pakistan';
    const companyPhone = settingsMap.invoiceCompanyPhone || '+92 300 0000000';
    const companyEmail = settingsMap.invoiceCompanyEmail || 'info@digitaltechsouls.com';
    const taxId = settingsMap.invoiceTaxId || '';
    const footerText = settingsMap.invoiceFooterText || 'Thank you for your business!';
    const primaryColor = settingsMap.invoicePrimaryColor || '#2563eb';
    const logoUrl = settingsMap.invoiceLogoUrl || '';
    const taxRate = parseFloat(settingsMap.invoiceTaxRate || '0');
    const discountRate = parseFloat(settingsMap.invoiceDiscountRate || '0');

    // Attempt to fetch logo buffer if url is provided
    let logoBuffer = null;
    if (logoUrl) {
      try {
        const fetchUrl = logoUrl.startsWith('/') ? `http://localhost:3000${logoUrl}` : logoUrl;
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          logoBuffer = Buffer.from(arrayBuffer);
        }
      } catch (e) {
        // Ignore logo error
      }
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Top colored accent bar
      doc.rect(0, 0, doc.page.width, 10).fill(primaryColor);

      let currentHeaderY = 40;

      // Right Side - Invoice Meta
      doc.fontSize(24).fillColor(primaryColor).font('Helvetica-Bold').text('INVOICE', 350, currentHeaderY, { align: 'right', width: 195 });
      doc.fontSize(10).fillColor('#666666').font('Helvetica').text(`Invoice No: INV-${order.id + 10000}`, 350, currentHeaderY + 30, { align: 'right', width: 195 });
      const dateObj = new Date(order.createdAt);
      doc.text(`Date: ${dateObj.toLocaleDateString()}`, 350, currentHeaderY + 45, { align: 'right', width: 195 });
      doc.text(`Payment: ${order.paymentMethod || 'Manual'}`, 350, currentHeaderY + 60, { align: 'right', width: 195 });

      // Left Side - Company Info
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 50, currentHeaderY, { height: 35 });
          currentHeaderY += 45;
        } catch (e) {}
      } else {
        doc.fontSize(18).fillColor(primaryColor).font('Helvetica-Bold').text(companyName.toUpperCase(), 50, currentHeaderY, { align: 'left' });
        currentHeaderY += 25;
      }

      doc.fontSize(10).fillColor('#333333').font('Helvetica');
      doc.text(companyAddress, 50, currentHeaderY);
      doc.text(`Phone: ${companyPhone}`, 50, currentHeaderY + 15);
      doc.text(`Email: ${companyEmail}`, 50, currentHeaderY + 30);
      if (taxId) {
        doc.text(`Tax ID: ${taxId}`, 50, currentHeaderY + 45);
      }

      // Separator Line
      doc.moveTo(50, 150).lineTo(545, 150).strokeColor('#E5E7EB').lineWidth(1).stroke();

      // Bill To Section
      doc.fontSize(12).fillColor(primaryColor).font('Helvetica-Bold').text('Bill To:', 50, 165);
      doc.fontSize(10).fillColor('#333333').font('Helvetica-Bold').text(`${order.user.username || order.user.email}`, 50, 185);
      doc.font('Helvetica').text(`${order.user.email}`, 50, 200);
      
      // Order Status Watermark
      doc.save();
      let stampColor = '#ef4444'; // Red default for unpaid/cancelled
      let stampText = order.status;
      
      if (order.status === 'PAID' || order.status === 'COMPLETED') {
        stampColor = '#22c55e'; // Green
      } else if (order.status === 'PENDING' || order.status === 'PROCESSING') {
        stampColor = '#eab308'; // Yellow
        stampText = order.status === 'PENDING' ? 'PENDING' : 'PROCESSING';
      } else {
        stampText = order.status === 'CANCELLED' ? 'CANCELLED' : 'UNPAID';
      }

      doc.fontSize(70)
         .fillColor(stampColor)
         .opacity(0.1)
         .rotate(-30, { origin: [300, 450] })
         .text(stampText.toUpperCase(), 150, 450, { align: 'center', width: 300 });
      doc.restore();

      // Table Header
      const tableTop = 240;
      doc.rect(50, tableTop, 495, 20).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
      doc.text('Item Description', 65, tableTop + 5);
      doc.text('Qty', 350, tableTop + 5, { width: 40, align: 'center' });
      doc.text('Price', 400, tableTop + 5, { width: 60, align: 'right' });
      doc.text('Total', 470, tableTop + 5, { width: 60, align: 'right' });
      doc.font('Helvetica');

      // Table Rows
      const currencySymbol = order.currency === 'PKR' ? 'Rs.' : '$';
      const subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
      
      let currentY = tableTop + 20;
      
      order.items.forEach((item, i) => {
        const rowBg = i % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
        doc.rect(50, currentY, 495, 25).fill(rowBg);
        
        doc.fillColor('#333333').fontSize(10);
        doc.text(`${item.productType}: ${item.productName}`, 65, currentY + 8, { width: 280 });
        doc.text('1', 350, currentY + 8, { width: 40, align: 'center' });
        doc.text(`${currencySymbol}${item.price.toFixed(2)}`, 400, currentY + 8, { width: 60, align: 'right' });
        doc.text(`${currencySymbol}${item.price.toFixed(2)}`, 470, currentY + 8, { width: 60, align: 'right' });
        
        currentY += 25;
      });

      // Bottom border for table
      doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor('#E5E7EB').lineWidth(1).stroke();
      
      // Totals Section
      let totalsY = currentY + 15;
      
      const discountAmount = subtotal * (discountRate / 100);
      const taxAmount = (subtotal - discountAmount) * (taxRate / 100);

      doc.fontSize(10).fillColor('#666666').font('Helvetica').text('Subtotal:', 350, totalsY);
      doc.fillColor('#333333').text(`${currencySymbol}${subtotal.toFixed(2)}`, 440, totalsY, { width: 90, align: 'right' });
      totalsY += 15;

      if (discountRate > 0) {
        doc.fillColor('#666666').text(`Discount (${discountRate}%):`, 350, totalsY);
        doc.fillColor('#ef4444').text(`-${currencySymbol}${discountAmount.toFixed(2)}`, 440, totalsY, { width: 90, align: 'right' });
        totalsY += 15;
      }

      if (taxRate > 0) {
        doc.fillColor('#666666').text(`Tax (${taxRate}%):`, 350, totalsY);
        doc.fillColor('#333333').text(`+${currencySymbol}${taxAmount.toFixed(2)}`, 440, totalsY, { width: 90, align: 'right' });
        totalsY += 15;
      }

      // Separator before Total
      doc.moveTo(350, totalsY).lineTo(545, totalsY).strokeColor('#E5E7EB').stroke();
      totalsY += 5;

      // Final Total Box
      doc.rect(340, totalsY, 205, 25).fill('#F3F4F6');
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Total:', 350, totalsY + 6);
      doc.text(`${currencySymbol}${order.totalAmount.toFixed(2)}`, 440, totalsY + 6, { width: 90, align: 'right' });
      doc.font('Helvetica');

      // Use absolute positioning for the footer so it never pushes content to a new page
      const pageBottom = doc.page.height;
      
      // Notes / Terms
      doc.fontSize(10).fillColor('#333333').font('Helvetica-Bold').text('Terms & Conditions', 50, pageBottom - 110);
      doc.fontSize(8).fillColor('#666666').font('Helvetica').text('1. Please ensure all payments are made promptly.\n2. All sales are final for digital themes and tools unless otherwise stated.\n3. Keep this invoice for your records.', 50, pageBottom - 95, { width: 300, lineGap: 3 });

      // Footer
      doc.moveTo(50, pageBottom - 50).lineTo(545, pageBottom - 50).strokeColor(primaryColor).lineWidth(2).stroke();
      doc.fontSize(9).fillColor('#666666').text(footerText, 50, pageBottom - 40, { align: 'center', width: 495 });

      doc.end();
    });
  }

  async resendInvoiceEmail(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true }
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.user?.email) throw new BadRequestException('User email not found');

    const invoiceBuffer = await this.generateInvoice(orderId);
    await this.mailService.sendOrderPaidEmail(order.user.email, order.id, order.totalAmount, order.currency, invoiceBuffer);
    
    return { success: true, message: 'Invoice email sent successfully' };
  }
}
