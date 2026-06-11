import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('q') q: string) {
    if (!q || q.trim() === '') {
      return { themes: [], services: [], plans: [], blogs: [] };
    }
    return this.searchService.globalSearch(q);
  }
}
