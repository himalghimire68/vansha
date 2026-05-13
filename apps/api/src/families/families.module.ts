import { Module } from '@nestjs/common';

import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';
import { GraphDatabaseService } from '../common/services/graph-database.service';
import { AuditService } from '../common/services/audit.service';

/**
 * Families Module
 * Handles family tree creation and member management
 */
@Module({
  controllers: [FamiliesController],
  providers: [FamiliesService, GraphDatabaseService, AuditService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
