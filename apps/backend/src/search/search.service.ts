import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    const searchString = query.toLowerCase();

    // Run queries concurrently for maximum performance
    const [themes, services, plans, blogs] = await Promise.all([
      // 1. Search Themes/Tools/Software
      this.prisma.themeTool.findMany({
        where: {
          OR: [
            { name: { contains: searchString } },
            { description: { contains: searchString } }
          ]
        },
        take: 5
      }),

      // 2. Search Services
      this.prisma.service.findMany({
        where: {
          OR: [
            { name: { contains: searchString } },
            { description: { contains: searchString } }
          ]
        },
        take: 5
      }),

      // 3. Search Hosting Plans
      this.prisma.plan.findMany({
        where: {
          OR: [
            { name: { contains: searchString } }
          ]
        },
        take: 5
      }),

      // 4. Search Blog Posts
      this.prisma.blogPost.findMany({
        where: {
          OR: [
            { title: { contains: searchString } },
            { content: { contains: searchString } },
            { category: { contains: searchString } },
            { tags: { contains: searchString } },
            { seoKeywords: { contains: searchString } }
          ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      themes,
      services,
      plans,
      blogs
    };
  }
}
