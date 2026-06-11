import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('services')
@UseGuards(RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles('ADMIN_USER', 'SUPER_USER')
  create(@Body() createServiceDto: any) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN_USER', 'SUPER_USER')
  update(@Param('id') id: string, @Body() updateServiceDto: any) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  @Roles('ADMIN_USER', 'SUPER_USER')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
