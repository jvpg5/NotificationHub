import { EquipmentStatusRule } from './equipment-status.rule';
import { EventType } from 'shared-types';
import { RuleEvaluationContext } from '../interfaces/rule.interface';

const context: RuleEvaluationContext = {
  farmName: 'Fazenda Boa Esperança',
};

const makeEquipmentEvent = (value: string) => ({
  eventId: 'evt-001',
  farmId: 'farm-001',
  deviceId: 'irrigation-pump-01',
  type: EventType.EQUIPMENT_STATUS,
  value,
  unit: '',
  timestamp: '2026-08-30T10:00:00Z',
});

// ── EquipmentStatusRule ──────────────────────────────────────────────────────

describe('EquipmentStatusRule', () => {
  const rule = new EquipmentStatusRule();

  it('should trigger when value is FAILURE', () => {
    const result = rule.evaluate(makeEquipmentEvent('FAILURE'), context);
    expect(result.triggered).toBe(true);
    expect(result.notification?.ruleTriggered).toBe('EQUIPMENT_FAILURE');
    expect(result.notification?.severity).toBe('CRITICAL');
    expect(result.notification?.message).toBe(
      '🚨 Equipment failure: a failure was detected on equipment irrigation-pump-01.',
    );
  });

  it('should not trigger when value is OK', () => {
    const result = rule.evaluate(makeEquipmentEvent('OK'), context);
    expect(result.triggered).toBe(false);
  });

  it('should not trigger when value is MAINTENANCE', () => {
    const result = rule.evaluate(makeEquipmentEvent('MAINTENANCE'), context);
    expect(result.triggered).toBe(false);
  });

  it('should render the expected message byte-for-byte', () => {
    const result = rule.evaluate(makeEquipmentEvent('FAILURE'), context);
    expect(result.notification?.message).toBe(
      '🚨 Equipment failure: a failure was detected on equipment irrigation-pump-01.',
    );
  });
});