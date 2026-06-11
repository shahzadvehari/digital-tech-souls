import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param, Delete } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getMyStats(@Request() req: any) {
    return this.affiliatesService.getUserStats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  async requestWithdrawal(@Request() req: any, @Body() body: any) {
    return this.affiliatesService.requestWithdrawal(req.user.id, body.amount, body.paymentMethod, body.paymentDetails);
  }

  @UseGuards(JwtAuthGuard)
  @Get('withdrawals')
  async getMyWithdrawals(@Request() req: any) {
    return this.affiliatesService.getUserWithdrawals(req.user.id);
  }

  // --- Admin Routes ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  @Get('admin/withdrawals')
  async getAllWithdrawals() {
    return this.affiliatesService.getAllWithdrawals();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  @Patch('admin/withdrawals/:id/status')
  async updateWithdrawalStatus(@Param('id') id: string, @Body() body: any) {
    return this.affiliatesService.updateWithdrawalStatus(+id, body.status, body.adminNote);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  @Post('admin/withdrawals')
  async createAdminWithdrawal(@Body() body: any) {
    return this.affiliatesService.createAdminWithdrawal(
      body.userId,
      body.amount,
      body.paymentMethod,
      body.paymentDetails,
      body.status,
      body.adminNote
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  @Patch('admin/withdrawals/:id')
  async updateAdminWithdrawal(@Param('id') id: string, @Body() body: any) {
    return this.affiliatesService.updateAdminWithdrawal(
      +id,
      body.amount,
      body.paymentMethod,
      body.paymentDetails,
      body.status,
      body.adminNote
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  @Delete('admin/withdrawals/:id')
  async deleteAdminWithdrawal(@Param('id') id: string) {
    return this.affiliatesService.deleteAdminWithdrawal(+id);
  }
}
