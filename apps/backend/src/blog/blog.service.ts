import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    // Basic slug generation from title if not provided
    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    // Ensure slug is unique by appending timestamp if needed, but for simplicity let's assume it's fine for now
    return this.prisma.blogPost.create({
      data,
    });
  }

  findAll() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.blogPost.findUnique({
      where: { id },
    });
  }

  update(id: number, data: any) {
    if (data.title && !data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.blogPost.delete({
      where: { id },
    });
  }
}
