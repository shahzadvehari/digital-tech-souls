import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createOrderDto: any) {
    return this.ordersService.create(req.user.sub, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  findAllForUser(@Request() req: any) {
    return this.ordersService.findAllForUser(req.user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(+id, status);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.ordersService.update(+id, updateDto);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/invoice')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.ordersService.generateInvoice(+id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Post(':id/resend-invoice')
  resendInvoice(@Param('id') id: string) {
    return this.ordersService.resendInvoiceEmail(+id);
  }
}
