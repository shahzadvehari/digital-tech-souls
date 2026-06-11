import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { MailService } from '../mail/mail.service';

@Controller('settings')
@UseGuards(RolesGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly mailService: MailService
  ) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Post()
  @Roles('SUPER_USER')
  upsert(@Body() body: { key: string; value: string; description?: string }) {
    return this.settingsService.upsert(body.key, body.value, body.description);
  }

  @Post('bulk')
  @Roles('SUPER_USER')
  upsertBulk(@Body() settings: { key: string; value: string; description?: string }[]) {
    if (!Array.isArray(settings)) {
      return { success: false, message: 'Expected an array of settings' };
    }
    return this.settingsService.upsertBulk(settings);
  }

  @Post('test-smtp')
  @Roles('SUPER_USER')
  testSmtp(@Body() body: { to: string }) {
    if (!body.to) return { success: false, message: 'Recipient email is required.' };
    return this.mailService.testSmtp(body.to);
  }
}
