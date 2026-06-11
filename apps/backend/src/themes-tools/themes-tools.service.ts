import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ThemesToolsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.themeTool.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.themeTool.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async create(data: any) {
    return this.prisma.themeTool.create({
      data: {
        name: data.name,
        type: data.type || 'THEME',
        price: data.price ? parseFloat(data.price) : null,
        description: data.description,
        features: data.features,
        imageUrl: data.imageUrl,
        logoUrl: data.logoUrl,
        downloadUrl: data.downloadUrl,
        livePreviewUrl: data.livePreviewUrl,
      },
    });
  }

  async createBulk(items: any[]) {
    const formattedItems = items.map(data => ({
      name: data.name,
      type: data.type || 'THEME',
      price: data.price ? parseFloat(data.price) : null,
      description: data.description || '',
      features: data.features,
      imageUrl: data.imageUrl,
      logoUrl: data.logoUrl,
      downloadUrl: data.downloadUrl,
      livePreviewUrl: data.livePreviewUrl,
      metaTitle: data.metaTitle,
      metaDesc: data.metaDesc,
      seoKeywords: data.seoKeywords,
    }));
    return this.prisma.themeTool.createMany({
      data: formattedItems,
    });
  }

  async update(id: number, data: any) {
    await this.findOne(id); // Ensure it exists
    
    const updateData: any = { ...data };
    if (data.price !== undefined) {
      updateData.price = data.price ? parseFloat(data.price) : null;
    }
    
    return this.prisma.themeTool.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.themeTool.delete({ where: { id } });
  }
}
