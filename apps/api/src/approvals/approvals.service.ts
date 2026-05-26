import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateApprovalRequest } from '@vansha/shared-types';
import { ApprovalRequestEntity } from '../approval-request.entity';
import { AuditService } from '../common/services/audit.service';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(ApprovalRequestEntity)
    private approvalRepository: Repository<ApprovalRequestEntity>,
    private auditService: AuditService,
  ) {}

  async requestApproval(
    familyId: string,
    data: CreateApprovalRequest,
    userId: string,
  ): Promise<ApprovalRequestEntity> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

    const approval = this.approvalRepository.create({
      familyId,
      personId: data.personId,
      requestedBy: userId,
      requestedChanges: JSON.stringify(data.requestedChanges),
      status: 'pending',
      expiresAt,
    });

    const saved = await this.approvalRepository.save(approval);

    await this.auditService.log({
      actorId: userId,
      action: 'create',
      resourceType: 'approval_request',
      resourceId: saved.id,
      familyId,
      newValues: { personId: data.personId, changes: data.requestedChanges },
      status: 'success',
    });

    return saved;
  }

  async approve(approvalId: string, userId: string): Promise<ApprovalRequestEntity> {
    const approval = await this.approvalRepository.findOne({ where: { id: approvalId } });
    if (!approval) throw new NotFoundException('Approval request not found');

    approval.status = 'approved';
    approval.approvedBy = userId;
    approval.approvedAt = new Date();

    const saved = await this.approvalRepository.save(approval);
    await this.auditService.logApproval(userId, approvalId, true);
    return saved;
  }

  async reject(approvalId: string, reason: string, userId: string): Promise<ApprovalRequestEntity> {
    const approval = await this.approvalRepository.findOne({ where: { id: approvalId } });
    if (!approval) throw new NotFoundException('Approval request not found');

    approval.status = 'rejected';
    approval.approvedBy = userId;
    approval.rejectionReason = reason;
    approval.approvedAt = new Date();

    const saved = await this.approvalRepository.save(approval);
    await this.auditService.logApproval(userId, approvalId, false);
    return saved;
  }

  async getPendingApprovals(familyId: string): Promise<ApprovalRequestEntity[]> {
    return this.approvalRepository.find({
      where: { familyId, status: 'pending' },
      order: { createdAt: 'DESC' },
    });
  }
}
