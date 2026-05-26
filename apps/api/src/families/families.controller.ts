import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateFamilyRequest } from '@vansha/shared-types';

import { FamiliesService } from './families.service';

/**
 * Families Controller
 * Handles family tree API endpoints
 */
@ApiTags('Families')
@Controller('families')
export class FamiliesController {
  constructor(private familiesService: FamiliesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family tree' })
  async create(@Body() data: CreateFamilyRequest, @Req() req: any) {
    if (!data.name) {
      throw new BadRequestException('Family name is required');
    }

    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.familiesService.createFamily(userId, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get family by ID' })
  async getById(@Param('id') familyId: string, @Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.familiesService.getFamily(familyId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List user\'s families' })
  async list(@Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.familiesService.getUserFamilies(userId);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite member to family' })
  async invite(
    @Param('id') familyId: string,
    @Body() data: { email: string; role: string },
    @Req() req: any,
  ) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.familiesService.inviteMember(familyId, data.email, data.role, userId);
  }
}
