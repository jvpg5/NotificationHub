import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification as PrismaNotification } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationProvider,
  NotificationPayload,
} from '../notification-providers/interfaces/notification-provider.interface';
import { NOTIFICATION_PROVIDER } from '../notification-providers/notification-providers.module';

interface NotificationGeneratedPayload {
  eventId: string;
  farmId: string;
  deviceId: string;
  eventType: string;
  eventValue: number | string;
  ruleTriggered: string;
  severity: string;
  message: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(NOTIFICATION_PROVIDER)
    private readonly provider: NotificationProvider,
  ) {}

  @OnEvent('notification.generated')
  async handleNotificationGenerated(payload: NotificationGeneratedPayload) {
    // 1. Persist as PENDING
    const notification = await this.prisma.notification.create({
      data: {
        eventId: payload.eventId,
        farmId: payload.farmId,
        deviceId: payload.deviceId,
        eventType: payload.eventType,
        eventValue:
          typeof payload.eventValue === 'number' ? payload.eventValue : null,
        ruleTriggered: payload.ruleTriggered,
        severity: payload.severity,
        message: payload.message,
        status: 'PENDING',
      },
    });

    // 2. Look up farm phone for recipient
    const farm = await this.prisma.farm.findUnique({
      where: { id: payload.farmId },
    });

    const providerPayload: NotificationPayload = {
      recipient: farm?.phone ?? 'unknown',
      message: payload.message,
    };

    // 3. Attempt delivery (FR-9: never crash)
    let finalNotification: PrismaNotification;
    try {
      const result = await this.provider.send(providerPayload);
      if (result.ok) {
        finalNotification = await this.prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      } else {
        finalNotification = await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'FAILED',
            failureReason: result.error ?? 'Unknown error',
          },
        });
      }
    } catch (error) {
      // FR-9: provider throw contained
      const reason =
        error instanceof Error ? error.message : 'Provider threw exception';
      finalNotification = await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED', failureReason: reason },
      });
    }

    // 4. Emit final
    this.eventEmitter.emit('notification.sent', finalNotification);
  }

  async findAll(
    limit: number,
    offset: number,
    status?: string,
    severity?: string,
  ): Promise<{ data: PrismaNotification[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<PrismaNotification | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }
}