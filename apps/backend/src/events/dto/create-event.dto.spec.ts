import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EventType } from 'shared-types';
import { CreateEventDto } from './create-event.dto';

async function getValidationErrors(plain: Record<string, unknown>) {
  const dto = plainToInstance(CreateEventDto, plain);
  return validate(dto, { stopAtFirstError: false });
}

describe('CreateEventDto', () => {
  describe('valid events', () => {
    it('should accept a valid sensor event', async () => {
      const errors = await getValidationErrors({
        eventId: 'ev-1',
        farmId: 'f1',
        deviceId: 'd1',
        type: EventType.AIR_TEMPERATURE,
        value: 25,
        unit: 'C',
        timestamp: '2026-08-17T14:30:00-03:00',
      });

      expect(errors.length).toBe(0);
    });

    it('should accept a valid EQUIPMENT_STATUS event', async () => {
      const errors = await getValidationErrors({
        eventId: 'ev-2',
        farmId: 'f1',
        deviceId: 'd1',
        type: EventType.EQUIPMENT_STATUS,
        value: 'FAILURE',
        unit: null,
        timestamp: '2026-08-17T14:30:00-03:00',
      });

      expect(errors.length).toBe(0);
    });
  });

  describe('invalid events', () => {
    // S9: Missing eventId
    it('should reject a payload with missing eventId', async () => {
      const errors = await getValidationErrors({
        farmId: 'f1',
        deviceId: 'd1',
        type: EventType.AIR_TEMPERATURE,
        value: 25,
        unit: 'C',
        timestamp: '2026-08-17T14:30:00-03:00',
      });

      expect(errors.length).toBeGreaterThan(0);
      const propertyNames = errors.map((e) => e.property);
      expect(propertyNames).toContain('eventId');
    });

    // S11: Unknown type
    it('should reject an unknown event type', async () => {
      const errors = await getValidationErrors({
        eventId: 'ev-1',
        farmId: 'f1',
        deviceId: 'd1',
        type: 'WIND_SPEED',
        value: 50,
        unit: '%',
        timestamp: '2026-08-17T14:30:00-03:00',
      });

      expect(errors.length).toBeGreaterThan(0);
      const propertyNames = errors.map((e) => e.property);
      expect(propertyNames).toContain('type');
    });

    // S12: AIR_HUMIDITY out of range
    it('should reject AIR_HUMIDITY with value out of range', async () => {
      const errors = await getValidationErrors({
        eventId: 'ev-1',
        farmId: 'f1',
        deviceId: 'd1',
        type: EventType.AIR_HUMIDITY,
        value: 130,
        unit: '%',
        timestamp: '2026-08-17T14:30:00-03:00',
      });

      expect(errors.length).toBeGreaterThan(0);
      const propertyNames = errors.map((e) => e.property);
      expect(propertyNames).toContain('value');
    });

    // S13: AIR_TEMPERATURE unit mismatch
    it('should reject AIR_TEMPERATURE with wrong unit', async () => {
      const errors = await getValidationErrors({
        eventId: 'ev-1',
        farmId: 'f1',
        deviceId: 'd1',
        type: EventType.AIR_TEMPERATURE,
        value: 25,
        unit: '%',
        timestamp: '2026-08-17T14:30:00-03:00',
      });

      expect(errors.length).toBeGreaterThan(0);
      const propertyNames = errors.map((e) => e.property);
      expect(propertyNames).toContain('unit');
    });

    // S14: Invalid timestamp
    it('should reject an invalid timestamp', async () => {
      const errors = await getValidationErrors({
        eventId: 'ev-1',
        farmId: 'f1',
        deviceId: 'd1',
        type: EventType.AIR_TEMPERATURE,
        value: 25,
        unit: 'C',
        timestamp: 'not-a-date',
      });

      expect(errors.length).toBeGreaterThan(0);
      const propertyNames = errors.map((e) => e.property);
      expect(propertyNames).toContain('timestamp');
    });

    // S15: EQUIPMENT_STATUS numeric value
    it('should reject EQUIPMENT_STATUS with numeric value', async () => {
      const errors = await getValidationErrors({
        eventId: 'ev-1',
        farmId: 'f1',
        deviceId: 'd1',
        type: EventType.EQUIPMENT_STATUS,
        value: 42,
        unit: null,
        timestamp: '2026-08-17T14:30:00-03:00',
      });

      expect(errors.length).toBeGreaterThan(0);
      const propertyNames = errors.map((e) => e.property);
      expect(propertyNames).toContain('value');
    });

    // NFR-1: Multiple errors in one response
    it('should report all failing fields in one response (NFR-1)', async () => {
      const errors = await getValidationErrors({
        type: 'WIND_SPEED',
        value: 130,
        unit: 'X',
        timestamp: 'not-a-date',
      });

      expect(errors.length).toBeGreaterThanOrEqual(4);
    });
  });
});