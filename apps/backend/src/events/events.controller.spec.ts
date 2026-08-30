jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventType } from 'shared-types';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: {
    processEvent: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  const mockEvent = {
    id: 'ev-1',
    farmId: 'farm-001',
    deviceId: 'sensor-temp-01',
    type: EventType.AIR_TEMPERATURE,
    value: 25,
    textValue: null,
    unit: 'C',
    timestamp: '2026-08-17T14:30:00.000-03:00',
    receivedAt: '2026-08-17T14:30:01.000-03:00',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    eventsService = {
      processEvent: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: eventsService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  describe('POST /events', () => {
    it('should call service.processEvent and return result', async () => {
      const dto = {
        eventId: 'ev-1',
        farmId: 'farm-001',
        deviceId: 'sensor-temp-01',
        type: EventType.AIR_TEMPERATURE,
        value: 25,
        unit: 'C',
        timestamp: '2026-08-17T14:30:00-03:00',
      };
      eventsService.processEvent.mockResolvedValue(mockEvent);

      const result = await controller.create(dto);

      expect(eventsService.processEvent).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('GET /events', () => {
    it('should call service.findAll with parsed params and return result', async () => {
      const paginated = { data: [mockEvent], total: 1 };
      eventsService.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(50, 0);

      expect(eventsService.findAll).toHaveBeenCalledWith(50, 0, undefined);
      expect(result).toEqual(paginated);
    });

    it('should enforce max limit of 100', async () => {
      eventsService.findAll.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll(200, 0);

      expect(eventsService.findAll).toHaveBeenCalledWith(100, 0, undefined);
    });

    it('should pass type filter to service', async () => {
      eventsService.findAll.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll(50, 0, EventType.AIR_TEMPERATURE);

      expect(eventsService.findAll).toHaveBeenCalledWith(50, 0, EventType.AIR_TEMPERATURE);
    });
  });

  describe('GET /events/:id', () => {
    it('should call service.findOne and return result when found', async () => {
      eventsService.findOne.mockResolvedValue(mockEvent);

      const result = await controller.findOne('ev-1');

      expect(eventsService.findOne).toHaveBeenCalledWith('ev-1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException when event is not found', async () => {
      eventsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(controller.findOne('nonexistent')).rejects.toThrow('Event nonexistent not found');
    });
  });
});