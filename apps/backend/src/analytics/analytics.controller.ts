import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  trackVisit(@Req() req: Request, @Body() body: { path: string }) {
    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
    const userAgent = req.headers['user-agent'] || '';
    const country = (req.headers['cf-ipcountry'] || 'Unknown').toString();

    return this.analyticsService.trackVisit({
      path: body.path || '/',
      ipAddress,
      userAgent,
      country
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  getStats() {
    return this.analyticsService.getStats();
  }
}
