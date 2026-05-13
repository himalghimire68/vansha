import { Injectable } from '@nestjs/common';
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
  constructor(private configService: ConfigService) {}

  /**
   * Log an action to the audit trail
   * Used for compliance, debugging, and security monitoring
   */
  async log(data: AuditLogData): Promise<void> {
    // TODO: Implement database logging
    const logLevel = this.configService.get('LOG_LEVEL') || 'info';
    if (logLevel === 'debug') {
      console.log('[AUDIT]', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log approval action
   */
  async logApproval(
    actorId: string,
    approvalId: string,
    approved: boolean,
    reason?: string,
  ): Promise<void> {
    await this.log({
      actorId,
      action: approved ? 'approve' : 'reject',
      resourceType: 'approval_request',
      resourceId: approvalId,
      status: 'success',
    });
  }

  /**
   * Log person edit
   */
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
