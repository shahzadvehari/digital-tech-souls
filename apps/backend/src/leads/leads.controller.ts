import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('leads')
@UseGuards(RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Roles('ADMIN_USER', 'SUPER_USER', 'NORMAL_USER') // Public can submit leads
  create(@Body() createLeadDto: any) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @Roles('ADMIN_USER', 'SUPER_USER')
  findAll() {
    return this.leadsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN_USER', 'SUPER_USER')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN_USER', 'SUPER_USER')
  update(@Param('id') id: string, @Body() updateLeadDto: any) {
    return this.leadsService.update(+id, updateLeadDto);
  }

  @Delete(':id')
  @Roles('ADMIN_USER', 'SUPER_USER')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(+id);
  }
}
