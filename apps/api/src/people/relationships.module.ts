import { Module } from '@nestjs/common';
import { GraphDatabaseService } from '../common/services/graph-database.service';
import { RelationshipIntelligenceService } from '../common/services/relationship-intelligence.service';
import { RelationshipsController } from './relationships.controller';

/**
 * Relationships Module
 * Provides relationship intelligence and discovery APIs
 */
@Module({
  providers: [
    GraphDatabaseService,
    RelationshipIntelligenceService,
  ],
  controllers: [RelationshipsController],
  exports: [RelationshipIntelligenceService],
})
export class RelationshipsModule {}
