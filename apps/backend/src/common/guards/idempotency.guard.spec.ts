import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { IdempotencyGuard } from './idempotency.guard';
import { PrismaService } from '../../prisma/prisma.service';

// prettier-ignore
type PrismaMock = { event: { findUnique: jest.Mock } };

function createExecutionContext(
  body: Record<string, unknown> | null,
  responseSpies?: { status: jest.Mock; json: jest.Mock },
): ExecutionContext {
  const getRequest = jest.fn().mockReturnValue({ body });
  const getResponse = jest.fn().mockReturnValue(
    responseSpies ?? { status: jest.fn(), json: jest.fn() },
  );
  const switchToHttp = jest.fn().mockReturnValue({ getRequest, getResponse });
  return { switchToHttp } as unknown as ExecutionContext;
}

describe('IdempotencyGuard', () => {
  let guard: IdempotencyGuard;
  let prisma: PrismaMock;

  const storedEvent = {
    id: 'ev-1',
    farmId: 'farm-001',
    deviceId: 'sensor-temp-01',
    type: 'AIR_TEMPERATURE',
    value: 25,
    textValue: null,
    unit: 'C',
    timestamp: new Date('2026-08-17T14:30:00-03:00'),
    receivedAt: new Date('2026-08-17T14:30:01-03:00'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    prisma = {
      event: { findUnique: jest.fn() },
    };

    guard = new IdempotencyGuard(prisma as unknown as PrismaService);
  });

  describe('non-duplicate', () => {
    it('should return true when event is not in DB', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      const responseSpies = { status: jest.fn(), json: jest.fn() };
      const context = createExecutionContext({ eventId: 'ev-1' }, responseSpies);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(prisma.event.findUnique).toHaveBeenCalledWith({ where: { id: 'ev-1' } });
      expect(responseSpies.status).not.toHaveBeenCalled();
      expect(responseSpies.json).not.toHaveBeenCalled();
    });
  });

  describe('duplicate', () => {
    it('should return false and respond with 200 + stored event + duplicate:true', async () => {
      prisma.event.findUnique.mockResolvedValue(storedEvent);
      const responseSpies = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const context = createExecutionContext({ eventId: 'ev-1' }, responseSpies);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(responseSpies.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseSpies.json).toHaveBeenCalledWith({
        id: 'ev-1',
        farmId: 'farm-001',
        deviceId: 'sensor-temp-01',
        type: 'AIR_TEMPERATURE',
        value: 25,
        textValue: null,
        unit: 'C',
        timestamp: '2026-08-17T17:30:00.000Z',
        receivedAt: '2026-08-17T17:30:01.000Z',
        duplicate: true,
      });
    });
  });

  describe('missing eventId', () => {
    it('should return true when eventId is not in the body', async () => {
      const responseSpies = { status: jest.fn(), json: jest.fn() };
      const context = createExecutionContext({}, responseSpies);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(prisma.event.findUnique).not.toHaveBeenCalled();
      expect(responseSpies.status).not.toHaveBeenCalled();
      expect(responseSpies.json).not.toHaveBeenCalled();
    });

    it('should return true when body is null', async () => {
      const responseSpies = { status: jest.fn(), json: jest.fn() };
      const context = createExecutionContext(null, responseSpies);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(prisma.event.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('response shape', () => {
    it('should match toResponse() shape plus duplicate: true', async () => {
      prisma.event.findUnique.mockResolvedValue(storedEvent);
      const responseSpies = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const context = createExecutionContext({ eventId: 'ev-1' }, responseSpies);

      await guard.canActivate(context);

      const body = responseSpies.json.mock.calls[0][0];
      expect(body).toEqual({
        id: storedEvent.id,
        farmId: storedEvent.farmId,
        deviceId: storedEvent.deviceId,
        type: storedEvent.type,
        value: storedEvent.value,
        textValue: storedEvent.textValue,
        unit: storedEvent.unit,
        timestamp: storedEvent.timestamp.toISOString(),
        receivedAt: storedEvent.receivedAt.toISOString(),
        duplicate: true,
      });
      // timestamp and receivedAt must be ISO strings
      expect(typeof body.timestamp).toBe('string');
      expect(typeof body.receivedAt).toBe('string');
    });
  });
});