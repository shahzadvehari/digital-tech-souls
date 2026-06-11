import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createInvoiceDto: any) {
    if (!['SUPER_USER', 'ADMIN_USER'].includes(req.user.role)) {
      throw new UnauthorizedException('Only admins can create custom invoices directly');
    }
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get('backfill')
  async backfill() {
    return this.invoicesService.backfill();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  findAllAdmin(@Request() req: any) {
    if (!['SUPER_USER', 'ADMIN_USER'].includes(req.user.role)) {
      throw new UnauthorizedException();
    }
    return this.invoicesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-invoices')
  findMyInvoices(@Request() req: any) {
    return this.invoicesService.findByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const invoice = await this.invoicesService.findOne(+id);
    // Only allow admin or the owner to view
    if (!['SUPER_USER', 'ADMIN_USER'].includes(req.user.role) && invoice.userId !== req.user.userId) {
      throw new UnauthorizedException();
    }
    return invoice;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/status')
  updateStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    if (!['SUPER_USER', 'ADMIN_USER'].includes(req.user.role)) {
      throw new UnauthorizedException();
    }
    return this.invoicesService.updateStatus(+id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/pay')
  async submitPayment(@Request() req: any, @Param('id') id: string, @Body() data: { paymentMethod: string, paymentProof: string }) {
    const invoice = await this.invoicesService.findOne(+id);
    if (invoice.userId !== req.user.userId) {
      throw new UnauthorizedException();
    }
    return this.invoicesService.submitPayment(+id, data.paymentMethod, data.paymentProof);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id')
  updateAdmin(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    if (!['SUPER_USER', 'ADMIN_USER'].includes(req.user.role)) {
      throw new UnauthorizedException();
    }
    return this.invoicesService.update(+id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/:id/resend')
  resendEmail(@Request() req: any, @Param('id') id: string) {
    if (!['SUPER_USER', 'ADMIN_USER'].includes(req.user.role)) {
      throw new UnauthorizedException();
    }
    return this.invoicesService.resendInvoiceEmail(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  remove(@Request() req: any, @Param('id') id: string) {
    if (!['SUPER_USER', 'ADMIN_USER'].includes(req.user.role)) {
      throw new UnauthorizedException();
    }
    return this.invoicesService.remove(+id);
  }
}
