import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';
import { ApprovalRequestEntity } from '../approval-request.entity';
import { AuditService } from '../common/services/audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalRequestEntity])],
  controllers: [ApprovalsController],
  providers: [ApprovalsService, AuditService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
