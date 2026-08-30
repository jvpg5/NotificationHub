jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn(),
  OnEvent: jest.fn().mockReturnValue(jest.fn()),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  const mockNotification = {
    id: 'notif-1',
    eventId: 'ev-1',
    farmId: 'farm-001',
    deviceId: 'sensor-temp-01',
    eventType: 'AIR_TEMPERATURE',
    eventValue: 35.5,
    ruleTriggered: 'AIR_TEMP_HIGH',
    severity: 'WARNING',
    message: 'Air temperature is high: 35.5°C at Fazenda Boa Esperança',
    status: 'PENDING',
    sentAt: null,
    failureReason: null,
    createdAt: '2026-08-30T12:00:00.000Z',
    updatedAt: '2026-08-30T12:00:00.000Z',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    notificationsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  describe('GET /notifications', () => {
    it('should call service.findAll with default params and return result', async () => {
      const paginated = { data: [mockNotification], total: 1 };
      notificationsService.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(50, 0);

      expect(notificationsService.findAll).toHaveBeenCalledWith(50, 0, undefined, undefined);
      expect(result).toEqual(paginated);
    });

    it('should enforce max limit of 100', async () => {
      notificationsService.findAll.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll(200, 0);

      expect(notificationsService.findAll).toHaveBeenCalledWith(100, 0, undefined, undefined);
    });

    it('should pass status filter to service', async () => {
      notificationsService.findAll.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll(50, 0, 'FAILED');

      expect(notificationsService.findAll).toHaveBeenCalledWith(50, 0, 'FAILED', undefined);
    });

    it('should pass severity filter to service', async () => {
      notificationsService.findAll.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll(50, 0, undefined, 'WARNING');

      expect(notificationsService.findAll).toHaveBeenCalledWith(50, 0, undefined, 'WARNING');
    });

    it('should pass combined status and severity filters to service', async () => {
      notificationsService.findAll.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll(50, 0, 'FAILED', 'CRITICAL');

      expect(notificationsService.findAll).toHaveBeenCalledWith(50, 0, 'FAILED', 'CRITICAL');
    });
  });

  describe('GET /notifications/:id', () => {
    it('should call service.findOne and return result when found', async () => {
      notificationsService.findOne.mockResolvedValue(mockNotification);

      const result = await controller.findOne('notif-1');

      expect(notificationsService.findOne).toHaveBeenCalledWith('notif-1');
      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException when notification is not found', async () => {
      notificationsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(controller.findOne('nonexistent')).rejects.toThrow('Notification nonexistent not found');
    });
  });
});