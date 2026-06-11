import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Prisma } from '../../prisma/generated/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  create(@Body() createPlanDto: Prisma.PlanCreateInput) {
    return this.plansService.create(createPlanDto);
  }

  // Override class-level guards for public access
  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  // Override class-level guards for public access
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  update(@Param('id') id: string, @Body() updatePlanDto: Prisma.PlanUpdateInput) {
    return this.plansService.update(+id, updatePlanDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_USER', 'SUPER_USER')
  remove(@Param('id') id: string) {
    return this.plansService.remove(+id);
  }
}
