import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('guest')
  createGuest(@Body() createGuestDto: { name: string, email: string, subject: string, priority: string, message: string }) {
    return this.ticketsService.createGuestTicket(createGuestDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() createTicketDto: { subject: string, priority: string, message: string, phone?: string, city?: string, country?: string }) {
    return this.ticketsService.create(req.user.userId, createTicketDto);
  }

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard)
  findMyTickets(@Request() req: any) {
    return this.ticketsService.findByUser(req.user.userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER', 'RESELLER_USER')
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.ticketsService.findOne(+id, req.user);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  reply(@Request() req: any, @Param('id') id: string, @Body() replyDto: { message: string }) {
    return this.ticketsService.reply(+id, req.user, replyDto.message);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  close(@Request() req: any, @Param('id') id: string) {
    return this.ticketsService.close(+id, req.user);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER', 'RESELLER_USER')
  updateAsAdmin(@Param('id') id: string, @Body() updateDto: any) {
    return this.ticketsService.updateAsAdmin(+id, updateDto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER', 'RESELLER_USER')
  deleteAsAdmin(@Param('id') id: string) {
    return this.ticketsService.deleteAsAdmin(+id);
  }
}
