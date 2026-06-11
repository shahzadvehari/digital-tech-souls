import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ThemesToolsService } from './themes-tools.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('themes-tools')
export class ThemesToolsController {
  constructor(private readonly themesToolsService: ThemesToolsService) {}

  @Get()
  findAll() {
    return this.themesToolsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.themesToolsService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Post()
  create(@Body() createData: any) {
    return this.themesToolsService.create(createData);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Post('bulk')
  createBulk(@Body() items: any[]) {
    if (!Array.isArray(items)) {
      throw new Error('Expected an array of items for bulk creation');
    }
    return this.themesToolsService.createBulk(items);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.themesToolsService.update(+id, updateData);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.themesToolsService.remove(+id);
  }
}
