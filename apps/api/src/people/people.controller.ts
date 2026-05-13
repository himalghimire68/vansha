import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  BadRequestException,
  ApiTags,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreatePersonRequest } from '@vansha/shared-types';

import { PeopleService } from './people.service';

/**
 * People Controller
 * Handles genealogical data API endpoints
 */
@ApiTags('People')
@Controller('families/:familyId/people')
export class PeopleController {
  constructor(private peopleService: PeopleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  async create(
    @Param('familyId') familyId: string,
    @Body() data: CreatePersonRequest,
    @Req() req: any,
  ) {
    if (!data.firstName || !data.lastName) {
      throw new BadRequestException('First name and last name are required');
    }

    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.peopleService.createPerson(familyId, data, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get person by ID' })
  async getById(@Param('familyId') familyId: string, @Param('id') personId: string) {
    return this.peopleService.getPerson(personId, familyId);
  }

  @Get(':id/ancestors')
  @ApiOperation({ summary: 'Get person\'s ancestors' })
  async getAncestors(
    @Param('id') personId: string,
    @Query('generations') generations?: number,
  ) {
    return this.peopleService.getAncestors(personId, generations || 3);
  }

  @Get(':id/descendants')
  @ApiOperation({ summary: 'Get person\'s descendants' })
  async getDescendants(
    @Param('id') personId: string,
    @Query('generations') generations?: number,
  ) {
    return this.peopleService.getDescendants(personId, generations || 3);
  }

  @Post(':id/relationship/:otherId')
  @ApiOperation({ summary: 'Find relationship between two people' })
  async findRelationship(
    @Param('id') personId1: string,
    @Param('otherId') personId2: string,
  ) {
    return this.peopleService.findRelationship(personId1, personId2);
  }
}
