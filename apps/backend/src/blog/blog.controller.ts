import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  create(@Body() createBlogDto: any) {
    return this.blogService.create(createBlogDto);
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  update(@Param('id') id: string, @Body() updateBlogDto: any) {
    return this.blogService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_USER', 'ADMIN_USER')
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
