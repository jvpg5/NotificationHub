jest.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: jest.fn(),
  OnEvent: jest.fn().mockReturnValue(jest.fn()),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event as PrismaEvent } from '@prisma/client';
import { EventType, Severity } from 'shared-types';
import { RulesService } from './rules.service';
import { RulesRegistry } from './rules.registry';
import { PrismaService } from '../prisma/prisma.service';

const makeEvent = (overrides: Partial<PrismaEvent> = {}): PrismaEvent =>
  ({
    id: 'evt-001',
    farmId: 'farm-1',
    deviceId: 'sensor-01',
    type: 'AIR_TEMPERATURE',
    value: 38.5,
    textValue: null,
    unit: 'C',
    timestamp: new Date('2026-08-30T10:00:00Z'),
    receivedAt: new Date('2026-08-30T10:00:01Z'),
    ...overrides,
  }) as PrismaEvent;

describe('RulesService', () => {
  let service: RulesService;
  let eventEmitter: { emit: jest.Mock };
  let registry: { getRulesForType: jest.Mock };
  let prisma: { farm: { findUnique: jest.Mock } };

  const farm = { id: 'farm-1', name: 'Fazenda Teste' };

  beforeEach(async () => {
    jest.clearAllMocks();

    eventEmitter = { emit: jest.fn() };
    registry = { getRulesForType: jest.fn().mockReturnValue([]) };
    prisma = {
      farm: { findUnique: jest.fn().mockResolvedValue(farm) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
        { provide: RulesRegistry, useValue: registry },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RulesService>(RulesService);
  });

  describe('handleEventReceived', () => {
    it('should emit notification.generated when a rule triggers', async () => {
      const rule = {
        id: 'RULE_X',
        eventType: EventType.AIR_TEMPERATURE,
        evaluate: jest.fn().mockReturnValue({
          triggered: true,
          notification: {
            ruleTriggered: 'RULE_X',
            severity: Severity.WARNING,
            message: 'Temperature too high',
          },
        }),
      };
      registry.getRulesForType.mockReturnValue([rule]);

      const event = makeEvent();

      await service.handleEventReceived(event);

      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith('notification.generated', {
        eventId: 'evt-001',
        farmId: 'farm-1',
        deviceId: 'sensor-01',
        eventType: 'AIR_TEMPERATURE',
        eventValue: 38.5,
        ruleTriggered: 'RULE_X',
        severity: Severity.WARNING,
        message: 'Temperature too high',
      });
    });

    it('should not emit when no rule triggers', async () => {
      const rule = {
        id: 'RULE_X',
        eventType: EventType.AIR_TEMPERATURE,
        evaluate: jest.fn().mockReturnValue({ triggered: false }),
      };
      registry.getRulesForType.mockReturnValue([rule]);

      await service.handleEventReceived(makeEvent());

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should log error and continue when a rule throws (FR-9)', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const rule = {
        id: 'RULE_X',
        eventType: EventType.AIR_TEMPERATURE,
        evaluate: jest.fn().mockImplementation(() => {
          throw new Error('Rule evaluation failed');
        }),
      };
      registry.getRulesForType.mockReturnValue([rule]);

      await service.handleEventReceived(makeEvent());

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error evaluating rule RULE_X for event evt-001:',
        expect.any(Error),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should not call getRulesForType for unknown event type', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const event = makeEvent({ type: 'UNKNOWN_TYPE' });

      await service.handleEventReceived(event);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown event type'),
      );
      expect(registry.getRulesForType).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should log warning and return when farm is not found', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      prisma.farm.findUnique.mockResolvedValue(null);

      await service.handleEventReceived(makeEvent());

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Farm farm-1 not found'),
      );
      expect(registry.getRulesForType).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should emit at most one notification per event (FR-7)', async () => {
      const rule1 = {
        id: 'RULE_1',
        eventType: EventType.AIR_TEMPERATURE,
        evaluate: jest.fn().mockReturnValue({
          triggered: true,
          notification: {
            ruleTriggered: 'RULE_1',
            severity: Severity.WARNING,
            message: 'First rule',
          },
        }),
      };
      const rule2 = {
        id: 'RULE_2',
        eventType: EventType.AIR_TEMPERATURE,
        evaluate: jest.fn().mockReturnValue({
          triggered: true,
          notification: {
            ruleTriggered: 'RULE_2',
            severity: Severity.CRITICAL,
            message: 'Second rule',
          },
        }),
      };
      registry.getRulesForType.mockReturnValue([rule1, rule2]);

      await service.handleEventReceived(makeEvent());

      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      // Only the first rule should have been evaluated
      expect(rule1.evaluate).toHaveBeenCalled();
      expect(rule2.evaluate).not.toHaveBeenCalled();
    });

    it('should map EQUIPMENT_STATUS value from textValue', async () => {
      const rule = {
        id: 'EQ_RULE',
        eventType: EventType.EQUIPMENT_STATUS,
        evaluate: jest.fn().mockReturnValue({
          triggered: true,
          notification: {
            ruleTriggered: 'EQ_RULE',
            severity: Severity.CRITICAL,
            message: 'Equipment failure',
          },
        }),
      };
      registry.getRulesForType.mockReturnValue([rule]);

      const event = makeEvent({
        type: 'EQUIPMENT_STATUS',
        value: null,
        textValue: 'FAILURE',
        unit: null,
      });

      await service.handleEventReceived(event);

      expect(eventEmitter.emit).toHaveBeenCalledWith('notification.generated', {
        eventId: 'evt-001',
        farmId: 'farm-1',
        deviceId: 'sensor-01',
        eventType: 'EQUIPMENT_STATUS',
        eventValue: 'FAILURE',
        ruleTriggered: 'EQ_RULE',
        severity: Severity.CRITICAL,
        message: 'Equipment failure',
      });
    });
  });
});