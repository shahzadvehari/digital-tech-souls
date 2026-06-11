import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientLogosService } from './client-logos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('client-logos')
export class ClientLogosController {
  constructor(private readonly clientLogosService: ClientLogosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  create(@Body() createClientLogoDto: any) {
    return this.clientLogosService.create(createClientLogoDto);
  }

  @Get()
  findAll() {
    return this.clientLogosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientLogosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  update(@Param('id') id: string, @Body() updateClientLogoDto: any) {
    return this.clientLogosService.update(+id, updateClientLogoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  remove(@Param('id') id: string) {
    return this.clientLogosService.remove(+id);
  }
}
