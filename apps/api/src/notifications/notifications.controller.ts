import { Controller, Get, Post, Body, Param, Req, BadRequestException, ApiTags } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { NotificationsService } from './notifications.service';

interface SendNotificationRequest {
  title: string;
  message: string;
  channels?: string[];
}

/**
 * Notifications Controller
 * Handles notification API endpoints
 */
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Send notification' })
  async send(@Body() data: SendNotificationRequest, @Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.notificationsService.sendNotification(
      userId,
      data.title,
      data.message,
      (data.channels as any) || ['in_app'],
    );
  }

  @Get('user')
  @ApiOperation({ summary: 'Get user notifications' })
  async getUserNotifications(@Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // TODO: Implement database query
    return [];
  }
}
