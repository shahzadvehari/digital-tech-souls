import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  create(@Body() createSaleDto: any) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  findAll() {
    return this.salesService.findAll();
  }

  @Get('reseller/:name')
  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER', 'RESELLER_USER')
  findByReseller(@Param('name') name: string) {
    return this.salesService.findByReseller(name);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  update(@Param('id') id: string, @Body() updateSaleDto: any) {
    return this.salesService.update(+id, updateSaleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
