import { AirTemperatureRule } from './air-temperature.rule';
import { AirHumidityRule } from './air-humidity.rule';
import { SoilMoistureRule } from './soil-moisture.rule';
import { WaterReservoirLevelRule } from './water-reservoir-level.rule';
import { SiloLevelRule } from './silo-level.rule';
import { EventType } from 'shared-types';
import { RuleEvaluationContext } from '../interfaces/rule.interface';

const context: RuleEvaluationContext = {
  farmName: 'Fazenda Boa Esperança',
};

const makeEvent = (overrides: Record<string, unknown>) => ({
  eventId: 'evt-001',
  farmId: 'farm-001',
  deviceId: 'sensor-temp-01',
  type: EventType.AIR_TEMPERATURE,
  value: 0,
  unit: '°C',
  timestamp: '2026-08-30T10:00:00Z',
  ...overrides,
});

// ── helpers ──────────────────────────────────────────────────────────────────

function makeTempEvent(value: number) {
  return makeEvent({ type: EventType.AIR_TEMPERATURE, deviceId: 'sensor-temp-01', value, unit: '°C' });
}

function makeHumidityEvent(value: number) {
  return makeEvent({ type: EventType.AIR_HUMIDITY, value, unit: '%' });
}

function makeMoistureEvent(value: number) {
  return makeEvent({ type: EventType.SOIL_MOISTURE, value, unit: '%' });
}

function makeReservoirEvent(value: number) {
  return makeEvent({ type: EventType.WATER_RESERVOIR_LEVEL, value, unit: '%' });
}

function makeSiloEvent(value: number) {
  return makeEvent({ type: EventType.SILO_LEVEL, deviceId: 'silo-sensor-01', value, unit: '%' });
}

// ── AirTemperatureRule ───────────────────────────────────────────────────────

describe('AirTemperatureRule', () => {
  const rule = new AirTemperatureRule();

  it('should trigger when temperature exceeds 35°C', () => {
    const result = rule.evaluate(makeTempEvent(38.5), context);
    expect(result.triggered).toBe(true);
    expect(result.notification?.ruleTriggered).toBe('AIR_TEMPERATURE_HIGH');
    expect(result.notification?.message).toBe(
      '⚠️ Temperature alert: 38.5°C recorded by sensor sensor-temp-01 at Fazenda Boa Esperança.',
    );
  });

  it('should not trigger at exactly 35.0°C (boundary)', () => {
    const result = rule.evaluate(makeTempEvent(35.0), context);
    expect(result.triggered).toBe(false);
  });

  it('should not trigger when temperature is normal (27.0°C)', () => {
    const result = rule.evaluate(makeTempEvent(27.0), context);
    expect(result.triggered).toBe(false);
  });

  it('should render the expected message byte-for-byte', () => {
    const result = rule.evaluate(makeTempEvent(38.5), context);
    expect(result.notification?.message).toBe(
      '⚠️ Temperature alert: 38.5°C recorded by sensor sensor-temp-01 at Fazenda Boa Esperança.',
    );
  });
});

// ── AirHumidityRule ──────────────────────────────────────────────────────────

describe('AirHumidityRule', () => {
  const rule = new AirHumidityRule();

  it('should trigger when humidity drops below 30%', () => {
    const result = rule.evaluate(makeHumidityEvent(24), context);
    expect(result.triggered).toBe(true);
    expect(result.notification?.ruleTriggered).toBe('AIR_HUMIDITY_LOW');
    expect(result.notification?.severity).toBe('INFO');
    expect(result.notification?.message).toBe(
      '⚠️ Low humidity alert: air humidity reached 24% at Fazenda Boa Esperança.',
    );
  });

  it('should not trigger at exactly 30.0% (boundary)', () => {
    const result = rule.evaluate(makeHumidityEvent(30.0), context);
    expect(result.triggered).toBe(false);
  });

  it('should not trigger when humidity is normal (45%)', () => {
    const result = rule.evaluate(makeHumidityEvent(45), context);
    expect(result.triggered).toBe(false);
  });

  it('should render the expected message byte-for-byte', () => {
    const result = rule.evaluate(makeHumidityEvent(24), context);
    expect(result.notification?.message).toBe(
      '⚠️ Low humidity alert: air humidity reached 24% at Fazenda Boa Esperança.',
    );
  });
});

// ── SoilMoistureRule ─────────────────────────────────────────────────────────

describe('SoilMoistureRule', () => {
  const rule = new SoilMoistureRule();

  it('should trigger when soil moisture drops below 20%', () => {
    const result = rule.evaluate(makeMoistureEvent(17), context);
    expect(result.triggered).toBe(true);
    expect(result.notification?.ruleTriggered).toBe('SOIL_MOISTURE_LOW');
    expect(result.notification?.severity).toBe('INFO');
    expect(result.notification?.message).toBe(
      '💧 Irrigation alert: soil moisture is at 17%. Check irrigation needs.',
    );
  });

  it('should not trigger at exactly 20.0% (boundary)', () => {
    const result = rule.evaluate(makeMoistureEvent(20.0), context);
    expect(result.triggered).toBe(false);
  });

  it('should not trigger when soil moisture is normal (45%)', () => {
    const result = rule.evaluate(makeMoistureEvent(45), context);
    expect(result.triggered).toBe(false);
  });

  it('should render the expected message byte-for-byte', () => {
    const result = rule.evaluate(makeMoistureEvent(17), context);
    expect(result.notification?.message).toBe(
      '💧 Irrigation alert: soil moisture is at 17%. Check irrigation needs.',
    );
  });
});

// ── WaterReservoirLevelRule ──────────────────────────────────────────────────

describe('WaterReservoirLevelRule', () => {
  const rule = new WaterReservoirLevelRule();

  it('should trigger when reservoir level drops below 15%', () => {
    const result = rule.evaluate(makeReservoirEvent(12), context);
    expect(result.triggered).toBe(true);
    expect(result.notification?.ruleTriggered).toBe('WATER_RESERVOIR_LOW');
    expect(result.notification?.severity).toBe('WARNING');
    expect(result.notification?.message).toBe(
      '💧 Low water level: the reservoir is at only 12% of capacity.',
    );
  });

  it('should not trigger at exactly 15.0% (boundary)', () => {
    const result = rule.evaluate(makeReservoirEvent(15.0), context);
    expect(result.triggered).toBe(false);
  });

  it('should not trigger when reservoir level is normal (50%)', () => {
    const result = rule.evaluate(makeReservoirEvent(50), context);
    expect(result.triggered).toBe(false);
  });

  it('should render the expected message byte-for-byte', () => {
    const result = rule.evaluate(makeReservoirEvent(12), context);
    expect(result.notification?.message).toBe(
      '💧 Low water level: the reservoir is at only 12% of capacity.',
    );
  });
});

// ── SiloLevelRule ────────────────────────────────────────────────────────────

describe('SiloLevelRule', () => {
  const rule = new SiloLevelRule();

  it('should trigger when silo level drops below 15%', () => {
    const result = rule.evaluate(makeSiloEvent(10), context);
    expect(result.triggered).toBe(true);
    expect(result.notification?.ruleTriggered).toBe('SILO_LEVEL_LOW');
    expect(result.notification?.severity).toBe('WARNING');
    expect(result.notification?.message).toBe(
      '⚠️ Low silo level: the silo monitored by silo-sensor-01 is at 10% of capacity.',
    );
  });

  it('should not trigger at exactly 15.0% (boundary)', () => {
    const result = rule.evaluate(makeSiloEvent(15.0), context);
    expect(result.triggered).toBe(false);
  });

  it('should not trigger when silo level is normal (50%)', () => {
    const result = rule.evaluate(makeSiloEvent(50), context);
    expect(result.triggered).toBe(false);
  });

  it('should render the expected message byte-for-byte', () => {
    const result = rule.evaluate(makeSiloEvent(10), context);
    expect(result.notification?.message).toBe(
      '⚠️ Low silo level: the silo monitored by silo-sensor-01 is at 10% of capacity.',
    );
  });
});