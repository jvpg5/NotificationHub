import { Test, TestingModule } from '@nestjs/testing';
import { RulesRegistry } from './rules.registry';
import { EventType } from 'shared-types';

describe('RulesRegistry', () => {
  let registry: RulesRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RulesRegistry],
    }).compile();
    registry = module.get<RulesRegistry>(RulesRegistry);
  });

  it('should register a rule and retrieve it by type', () => {
    const mockRule = {
      id: 'rule-001',
      eventType: EventType.AIR_TEMPERATURE,
      evaluate: jest.fn(),
    };

    registry.register(mockRule);
    const rules = registry.getRulesForType(EventType.AIR_TEMPERATURE);

    expect(rules).toHaveLength(1);
    expect(rules[0]).toBe(mockRule);
  });

  it('should return empty array for event type with no registered rules', () => {
    const rules = registry.getRulesForType(EventType.AIR_TEMPERATURE);
    expect(rules).toEqual([]);
  });

  it('should return multiple rules registered for the same event type', () => {
    const mockRule1 = {
      id: 'rule-001',
      eventType: EventType.AIR_TEMPERATURE,
      evaluate: jest.fn(),
    };
    const mockRule2 = {
      id: 'rule-002',
      eventType: EventType.AIR_TEMPERATURE,
      evaluate: jest.fn(),
    };

    registry.register(mockRule1);
    registry.register(mockRule2);
    const rules = registry.getRulesForType(EventType.AIR_TEMPERATURE);

    expect(rules).toHaveLength(2);
    expect(rules).toContain(mockRule1);
    expect(rules).toContain(mockRule2);
  });

  it('should not return rules of a different event type', () => {
    const mockRule = {
      id: 'rule-001',
      eventType: EventType.AIR_TEMPERATURE,
      evaluate: jest.fn(),
    };

    registry.register(mockRule);
    const rules = registry.getRulesForType(EventType.SOIL_MOISTURE);

    expect(rules).toEqual([]);
  });
});