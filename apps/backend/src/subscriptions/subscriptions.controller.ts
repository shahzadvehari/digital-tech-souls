import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  findMySubscriptions(@Request() req: any) {
    return this.subscriptionsService.findMySubscriptions(req.user.userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  create(@Body() body: any) {
    if (body.currentPeriodEnd) {
      body.currentPeriodEnd = new Date(body.currentPeriodEnd);
    }
    return this.subscriptionsService.create(body);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  update(@Param('id') id: string, @Body() body: any) {
    if (body.currentPeriodEnd) {
      body.currentPeriodEnd = new Date(body.currentPeriodEnd);
    }
    return this.subscriptionsService.update(+id, body);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(+id);
  }
}
