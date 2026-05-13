import { Module } from '@nestjs/common';

import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';
import { AuditService } from '../common/services/audit.service';

/**
 * Approvals Module
 * Handles ancestor edit approval workflow
 */
@Module({
  controllers: [ApprovalsController],
  providers: [ApprovalsService, AuditService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
