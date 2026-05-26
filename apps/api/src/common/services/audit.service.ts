import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AuditLogData {
  actorId?: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  resourceType: string;
  resourceId: string;
  familyId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  private debug: boolean;

  constructor(@Optional() private configService?: ConfigService) {
    this.debug = configService?.get('LOG_LEVEL') === 'debug';
  }

  async log(data: AuditLogData): Promise<void> {
    if (this.debug) {
      console.log('[AUDIT]', JSON.stringify(data));
    }
  }

  async logApproval(actorId: string, approvalId: string, approved: boolean): Promise<void> {
    await this.log({
      actorId,
      action: approved ? 'approve' : 'reject',
      resourceType: 'approval_request',
      resourceId: approvalId,
      status: 'success',
    });
  }

  async logPersonEdit(
    actorId: string,
    personId: string,
    familyId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      actorId,
      action: 'update',
      resourceType: 'person',
      resourceId: personId,
      familyId,
      oldValues,
      newValues,
      status: 'success',
    });
  }
}
