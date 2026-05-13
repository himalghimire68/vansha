import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  BadRequestException,
  ApiTags,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateApprovalRequest } from '@vansha/shared-types';

import { ApprovalsService } from './approvals.service';

interface ApproveRequest {
  approved: boolean;
  rejectionReason?: string;
}

/**
 * Approvals Controller
 * Handles approval workflow API endpoints
 */
@ApiTags('Approvals')
@Controller('families/:familyId/approvals')
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Post()
  @ApiOperation({ summary: 'Request approval for ancestor edit' })
  async create(
    @Param('familyId') familyId: string,
    @Body() data: CreateApprovalRequest,
    @Req() req: any,
  ) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.approvalsService.requestApproval(familyId, data, userId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending approvals for family' })
  async getPending(@Param('familyId') familyId: string) {
    return this.approvalsService.getPendingApprovals(familyId);
  }

  @Post(':id/decide')
  @ApiOperation({ summary: 'Approve or reject pending edit' })
  async decide(
    @Param('id') approvalId: string,
    @Body() data: ApproveRequest,
    @Req() req: any,
  ) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (data.approved) {
      return this.approvalsService.approve(approvalId, userId);
    } else {
      return this.approvalsService.reject(approvalId, data.rejectionReason || '', userId);
    }
  }
}
