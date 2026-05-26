import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationType } from '@vansha/shared-types';
import { NotificationEntity } from '../notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
    private configService: ConfigService,
  ) {}

  async sendNotification(
    userId: string,
    title: string,
    message: string,
    channels: NotificationChannel[] = [NotificationChannel.IN_APP],
    type: NotificationType = NotificationType.MILESTONE,
    relatedId?: string,
    relatedType?: string,
    senderId?: string,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      userId,
      senderId,
      title,
      message,
      type,
      relatedId,
      relatedType,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<NotificationEntity[]> {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    return this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true, readAt: new Date() },
    );
  }

  async notifyApprovalRequest(userId: string, familyId: string, personName: string): Promise<void> {
    await this.sendNotification(
      userId,
      'Approval Request',
      `An edit to ${personName}'s record requires your approval.`,
      [NotificationChannel.IN_APP],
      NotificationType.APPROVAL_REQUEST,
      familyId,
      'family',
    );
  }

  async notifyInvitation(userId: string, familyName: string, invitedBy: string): Promise<void> {
    await this.sendNotification(
      userId,
      `Invitation to join ${familyName}`,
      `${invitedBy} has invited you to join the ${familyName} family tree.`,
      [NotificationChannel.IN_APP],
      NotificationType.INVITATION,
    );
  }
}
