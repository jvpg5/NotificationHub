jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn(),
  OnEvent: jest.fn().mockReturnValue(jest.fn()),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification as PrismaNotification } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NOTIFICATION_PROVIDER } from '../notification-providers/notification-providers.module';
import {
  NotificationPayload,
  SendResult,
} from '../notification-providers/interfaces/notification-provider.interface';

interface GeneratedPayload {
  eventId: string;
  farmId: string;
  deviceId: string;
  eventType: string;
  eventValue: number | string;
  ruleTriggered: string;
  severity: string;
  message: string;
}

const makePayload = (
  overrides: Partial<GeneratedPayload> = {},
): GeneratedPayload => ({
  eventId: 'evt-001',
  farmId: 'farm-1',
  deviceId: 'sensor-01',
  eventType: 'AIR_TEMPERATURE',
  eventValue: 38.5,
  ruleTriggered: 'RULE_X',
  severity: 'WARNING',
  message: 'Temperature too high',
  ...overrides,
});

const makeNotification = (
  overrides: Partial<PrismaNotification> = {},
): PrismaNotification =>
  ({
    id: 'notif-001',
    eventId: 'evt-001',
    farmId: 'farm-1',
    deviceId: 'sensor-01',
    eventType: 'AIR_TEMPERATURE',
    eventValue: 38.5,
    ruleTriggered: 'RULE_X',
    severity: 'WARNING',
    message: 'Temperature too high',
    status: 'PENDING',
    sentAt: null,
    failureReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as PrismaNotification;

describe('NotificationsService', () => {
  let service: NotificationsService;
  let eventEmitter: { emit: jest.Mock };
  let provider: { send: jest.Mock };
  let prisma: {
    notification: {
      create: jest.Mock;
      update: jest.Mock;
    };
    farm: { findUnique: jest.Mock };
  };

  const farm = {
    id: 'farm-1',
    phone: '+5511999999999',
    name: 'Fazenda Teste',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    eventEmitter = { emit: jest.fn() };
    provider = { send: jest.fn() };
    prisma = {
      notification: {
        create: jest.fn(),
        update: jest.fn(),
      },
      farm: { findUnique: jest.fn().mockResolvedValue(farm) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: NOTIFICATION_PROVIDER, useValue: provider },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('handleNotificationGenerated', () => {
    it('should persist notification as PENDING, send via provider, update to SENT, and emit notification.sent (success)', async () => {
      const payload = makePayload();
      const pendingNotification = makeNotification({ status: 'PENDING' });
      const sentNotification = makeNotification({
        status: 'SENT',
        sentAt: new Date(),
      });

      prisma.notification.create.mockResolvedValue(pendingNotification);
      provider.send.mockResolvedValue({ ok: true } satisfies SendResult);
      prisma.notification.update.mockResolvedValue(sentNotification);

      await service.handleNotificationGenerated(payload);

      // Verify PENDING persist
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'PENDING',
          eventId: 'evt-001',
          farmId: 'farm-1',
          deviceId: 'sensor-01',
          eventType: 'AIR_TEMPERATURE',
        }),
      });

      // Verify farm lookup
      expect(prisma.farm.findUnique).toHaveBeenCalledWith({
        where: { id: 'farm-1' },
      });

      // Verify provider called with correct payload
      expect(provider.send).toHaveBeenCalledWith({
        recipient: '+5511999999999',
        message: 'Temperature too high',
      } satisfies NotificationPayload);

      // Verify updated to SENT
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-001' },
        data: { status: 'SENT', sentAt: expect.any(Date) },
      });

      // Verify notification.sent emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'notification.sent',
        sentNotification,
      );
    });

    it('should update to FAILED with failureReason when provider returns ok=false', async () => {
      const payload = makePayload();
      const pendingNotification = makeNotification({ status: 'PENDING' });
      const failedNotification = makeNotification({
        status: 'FAILED',
        failureReason: 'Sim error',
      });

      prisma.notification.create.mockResolvedValue(pendingNotification);
      provider.send.mockResolvedValue({
        ok: false,
        error: 'Sim error',
      } satisfies SendResult);
      prisma.notification.update.mockResolvedValue(failedNotification);

      await service.handleNotificationGenerated(payload);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-001' },
        data: { status: 'FAILED', failureReason: 'Sim error' },
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'notification.sent',
        failedNotification,
      );
    });

    it('should update to FAILED and contain error message when provider throws (FR-9)', async () => {
      const payload = makePayload();
      const pendingNotification = makeNotification({ status: 'PENDING' });
      const failedNotification = makeNotification({
        status: 'FAILED',
        failureReason: 'Provider crashed',
      });

      prisma.notification.create.mockResolvedValue(pendingNotification);
      provider.send.mockRejectedValue(new Error('Provider crashed'));
      prisma.notification.update.mockResolvedValue(failedNotification);

      await service.handleNotificationGenerated(payload);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-001' },
        data: { status: 'FAILED', failureReason: 'Provider crashed' },
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'notification.sent',
        failedNotification,
      );
    });

    it('should persist as PENDING before calling provider.send', async () => {
      const payload = makePayload();
      const pendingNotification = makeNotification({ status: 'PENDING' });
      const sentNotification = makeNotification({
        status: 'SENT',
        sentAt: new Date(),
      });

      prisma.notification.create.mockResolvedValue(pendingNotification);
      provider.send.mockResolvedValue({ ok: true } satisfies SendResult);
      prisma.notification.update.mockResolvedValue(sentNotification);

      await service.handleNotificationGenerated(payload);

      // Check call order: create must happen before send
      const createCallOrder = prisma.notification.create.mock.invocationCallOrder[0];
      const sendCallOrder = provider.send.mock.invocationCallOrder[0];

      expect(createCallOrder).toBeLessThan(sendCallOrder);
    });
  });
});