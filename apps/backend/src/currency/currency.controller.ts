import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  getAllCurrencies() {
    return this.currencyService.getAllCurrencies();
  }

  @Post('sync')
  syncAutoRates() {
    return this.currencyService.syncAutoRates();
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Post()
  addCurrency(@Body() body: any) {
    return this.currencyService.addCurrency(body);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Patch(':id')
  updateCurrency(@Param('id') id: string, @Body() body: any) {
    return this.currencyService.updateCurrency(+id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Delete(':id')
  removeCurrency(@Param('id') id: string) {
    return this.currencyService.removeCurrency(+id);
  }
}
