import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { SearchService } from './search.service';

/**
 * Search Controller
 * Handles search API endpoints
 */
@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('families/:familyId/people')
  @ApiOperation({ summary: 'Search people by name' })
  async searchPeople(
    @Param('familyId') familyId: string,
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.searchPeople(familyId, query, limit || 20);
  }

  @Get('families/:familyId/location')
  @ApiOperation({ summary: 'Search by location' })
  async searchByLocation(@Param('familyId') familyId: string, @Query('location') location: string) {
    return this.searchService.searchByLocation(familyId, location);
  }

  @Get('families/:familyId/gotra')
  @ApiOperation({ summary: 'Search by gotra' })
  async searchByGotra(@Param('familyId') familyId: string, @Query('gotra') gotra: string) {
    return this.searchService.searchByGotra(familyId, gotra);
  }
}
