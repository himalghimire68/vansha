import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RelationshipIntelligenceService } from '../common/services/relationship-intelligence.service';

/**
 * Relationships Controller
 * Endpoints for discovering and analyzing relationships between people
 */
@ApiTags('Relationships')
@ApiBearerAuth()
@Controller('relationships')
export class RelationshipsController {
  constructor(private relationshipIntelligence: RelationshipIntelligenceService) {}

  @Get('detect/:personId1/:personId2')
  @ApiOperation({ summary: 'Detect relationship between two people' })
  @ApiResponse({ status: 200, description: 'Relationship details' })
  async detectRelationship(
    @Param('personId1') personId1: string,
    @Param('personId2') personId2: string,
  ) {
    return this.relationshipIntelligence.detectRelationship(personId1, personId2);
  }

  @Get('descendants/:personId')
  @ApiOperation({ summary: 'Find all descendants of a person' })
  async findDescendants(
    @Param('personId') personId: string,
  ) {
    return this.relationshipIntelligence.findDescendants(personId);
  }

  @Get('ancestors/:personId')
  @ApiOperation({ summary: 'Find all ancestors of a person' })
  async findAncestors(
    @Param('personId') personId: string,
  ) {
    return this.relationshipIntelligence.findAncestors(personId);
  }

  @Get('siblings/:personId')
  @ApiOperation({ summary: 'Find all siblings of a person' })
  async findSiblings(
    @Param('personId') personId: string,
  ) {
    return this.relationshipIntelligence.findSiblings(personId);
  }

  @Post('compatibility-check')
  @ApiOperation({ summary: 'Check lineage compatibility between two people' })
  async checkCompatibility(
    @Body() body: { personId1: string; personId2: string; restrictionLevel?: number },
  ) {
    return this.relationshipIntelligence.checkLineageCompatibility(
      body.personId1,
      body.personId2,
      body.restrictionLevel,
    );
  }

  @Get('network/:personId')
  @ApiOperation({ summary: 'Find extended family network' })
  async findFamilyNetwork(
    @Param('personId') personId: string,
  ) {
    return this.relationshipIntelligence.findFamilyNetwork(personId);
  }

  @Get('generation-distance/:personId1/:personId2')
  @ApiOperation({ summary: 'Calculate generation distance' })
  async getGenerationDistance(
    @Param('personId1') personId1: string,
    @Param('personId2') personId2: string,
  ) {
    const distance = await this.relationshipIntelligence.calculateGenerationDistance(
      personId1,
      personId2,
    );
    return { distance };
  }
}
