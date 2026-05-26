import { Controller, Get, Post, Body, Param, Req, BadRequestException, Query, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

interface SendNotificationRequest {
  title: string;
  message: string;
  channels?: string[];
}

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Send notification' })
  async send(@Body() data: SendNotificationRequest, @Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new BadRequestException('User ID is required');

    return this.notificationsService.sendNotification(
      userId,
      data.title,
      data.message,
      (data.channels as any) || ['in_app'],
    );
  }

  @Get('user')
  @ApiOperation({ summary: 'Get user notifications' })
  async getUserNotifications(@Req() req: any, @Query('unread') unread?: string) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new BadRequestException('User ID is required');

    return this.notificationsService.getUserNotifications(userId, unread === 'true');
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new BadRequestException('User ID is required');

    await this.notificationsService.markAsRead(id, userId);
    return { success: true };
  }
}
