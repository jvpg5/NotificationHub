jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventType } from 'shared-types';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: {
    event: { create: jest.Mock; findMany: jest.Mock; count: jest.Mock; findUnique: jest.Mock };
    farm: { findUnique: jest.Mock };
    device: { findUnique: jest.Mock };
  };
  let eventEmitter: { emit: jest.Mock };

  const mockTimestamp = new Date('2026-08-17T14:30:00-03:00');
  const mockReceivedAt = new Date('2026-08-17T14:30:01-03:00');

  const persistedEvent = {
    id: 'ev-1',
    farmId: 'farm-001',
    deviceId: 'sensor-temp-01',
    type: EventType.AIR_TEMPERATURE,
    value: 25,
    textValue: null,
    unit: 'C',
    timestamp: mockTimestamp,
    receivedAt: mockReceivedAt,
  };

  const expectedResponse = {
    id: 'ev-1',
    farmId: 'farm-001',
    deviceId: 'sensor-temp-01',
    type: EventType.AIR_TEMPERATURE,
    value: 25,
    textValue: null,
    unit: 'C',
    timestamp: mockTimestamp.toISOString(),
    receivedAt: mockReceivedAt.toISOString(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      event: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn() },
      farm: { findUnique: jest.fn() },
      device: { findUnique: jest.fn() },
    };
    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  describe('processEvent', () => {
    const validSensorDto = {
      eventId: 'ev-1',
      farmId: 'farm-001',
      deviceId: 'sensor-temp-01',
      type: EventType.AIR_TEMPERATURE,
      value: 25,
      unit: 'C',
      timestamp: '2026-08-17T14:30:00-03:00',
    };

    it('should persist a valid sensor event with correct mapped fields', async () => {
      prisma.farm.findUnique.mockResolvedValue({ id: 'farm-001' });
      prisma.device.findUnique.mockResolvedValue({ id: 'sensor-temp-01', farmId: 'farm-001' });
      prisma.event.create.mockResolvedValue(persistedEvent);

      const result = await service.processEvent(validSensorDto);

      expect(prisma.farm.findUnique).toHaveBeenCalledWith({ where: { id: 'farm-001' } });
      expect(prisma.device.findUnique).toHaveBeenCalledWith({ where: { id: 'sensor-temp-01' } });
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          id: 'ev-1',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: EventType.AIR_TEMPERATURE,
          value: 25,
          textValue: null,
          unit: 'C',
          timestamp: new Date('2026-08-17T14:30:00-03:00'),
        },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('event.received', persistedEvent);
      expect(result).toEqual(expectedResponse);
    });

    it('should persist a valid EQUIPMENT_STATUS event with value=null and textValue set', async () => {
      const equipmentDto = {
        eventId: 'ev-2',
        farmId: 'farm-001',
        deviceId: 'irrigation-pump-01',
        type: EventType.EQUIPMENT_STATUS,
        value: 'FAILURE',
        unit: null as unknown as string,
        timestamp: '2026-08-17T14:35:00-03:00',
      };

      const equipmentPersisted = {
        id: 'ev-2',
        farmId: 'farm-001',
        deviceId: 'irrigation-pump-01',
        type: EventType.EQUIPMENT_STATUS,
        value: null,
        textValue: 'FAILURE',
        unit: null,
        timestamp: mockTimestamp,
        receivedAt: mockReceivedAt,
      };

      prisma.farm.findUnique.mockResolvedValue({ id: 'farm-001' });
      prisma.device.findUnique.mockResolvedValue({ id: 'irrigation-pump-01', farmId: 'farm-001' });
      prisma.event.create.mockResolvedValue(equipmentPersisted);

      const result = await service.processEvent(equipmentDto);

      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          id: 'ev-2',
          farmId: 'farm-001',
          deviceId: 'irrigation-pump-01',
          type: EventType.EQUIPMENT_STATUS,
          value: null,
          textValue: 'FAILURE',
          unit: null,
          timestamp: new Date('2026-08-17T14:35:00-03:00'),
        },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('event.received', equipmentPersisted);
      expect(result).toEqual({
        id: 'ev-2',
        farmId: 'farm-001',
        deviceId: 'irrigation-pump-01',
        type: EventType.EQUIPMENT_STATUS,
        value: null,
        textValue: 'FAILURE',
        unit: null,
        timestamp: mockTimestamp.toISOString(),
        receivedAt: mockReceivedAt.toISOString(),
      });
    });

    it('should throw BadRequestException when farm is not found', async () => {
      prisma.farm.findUnique.mockResolvedValue(null);

      await expect(service.processEvent(validSensorDto)).rejects.toThrow(BadRequestException);
      await expect(service.processEvent(validSensorDto)).rejects.toThrow('Farm farm-001 not found');
      expect(prisma.event.create).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when device does not belong to farm', async () => {
      prisma.farm.findUnique.mockResolvedValue({ id: 'farm-001' });
      prisma.device.findUnique.mockResolvedValue({ id: 'sensor-temp-01', farmId: 'farm-002' });

      await expect(service.processEvent(validSensorDto)).rejects.toThrow(BadRequestException);
      await expect(service.processEvent(validSensorDto)).rejects.toThrow(
        'Device sensor-temp-01 not found or does not belong to farm farm-001',
      );
      expect(prisma.event.create).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when device is not found', async () => {
      prisma.farm.findUnique.mockResolvedValue({ id: 'farm-001' });
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(service.processEvent(validSensorDto)).rejects.toThrow(BadRequestException);
      await expect(service.processEvent(validSensorDto)).rejects.toThrow(
        'Device sensor-temp-01 not found or does not belong to farm farm-001',
      );
      expect(prisma.event.create).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated results with total count', async () => {
      prisma.event.findMany.mockResolvedValue([persistedEvent]);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.findAll(50, 0);

      expect(result).toEqual({ data: [expectedResponse], total: 1 });
      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { timestamp: 'desc' },
        skip: 0,
        take: 50,
      });
      expect(prisma.event.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should filter by type when provided', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.findAll(10, 0, EventType.AIR_TEMPERATURE);

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { type: EventType.AIR_TEMPERATURE },
        orderBy: { timestamp: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(prisma.event.count).toHaveBeenCalledWith({
        where: { type: EventType.AIR_TEMPERATURE },
      });
    });

    it('should return empty data array with zero total when DB is empty', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      const result = await service.findAll(50, 0);

      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('findOne', () => {
    it('should return event when found', async () => {
      prisma.event.findUnique.mockResolvedValue(persistedEvent);

      const result = await service.findOne('ev-1');

      expect(result).toEqual(expectedResponse);
      expect(prisma.event.findUnique).toHaveBeenCalledWith({ where: { id: 'ev-1' } });
    });

    it('should return null when event is not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });
});