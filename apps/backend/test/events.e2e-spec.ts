// jest.mock must be at the very top (hoisted) — @nestjs/event-emitter v12 is ESM-only,
// which Jest in CJS mode cannot parse. This mock provides a CJS-compatible surface so
// the NestJS module system can boot. Business logic is NOT mocked — the real app,
// real DB, and real HTTP layer are exercised.
jest.mock('@nestjs/event-emitter', () => {
  const MockEventEmitter2 = jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
  }));

  return {
    EventEmitter2: MockEventEmitter2,
    EventEmitterModule: {
      forRoot: jest.fn(() => ({
        module: class {},
        global: true,
        providers: [
          {
            provide: MockEventEmitter2,
            useValue: { emit: jest.fn() },
          },
        ],
        exports: [MockEventEmitter2],
      })),
    },
    OnEvent: jest.fn(() => jest.fn()),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const TEST_DB_PATH = path.resolve(__dirname, '..', 'prisma', 'test.db');
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

describe('Events e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let originalDatabaseUrl: string | undefined;

  beforeAll(async () => {
    // 1. Save original DATABASE_URL
    originalDatabaseUrl = process.env.DATABASE_URL;

    // 2. Delete test.db and journal if they exist
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    const journalPath = `${TEST_DB_PATH}-journal`;
    if (fs.existsSync(journalPath)) {
      fs.unlinkSync(journalPath);
    }

    // 3. Run prisma db push to create schema in test DB
    try {
      execSync('npx prisma db push', {
        cwd: path.resolve(__dirname, '..'),
        env: { ...process.env, DATABASE_URL: TEST_DB_URL },
        stdio: 'pipe',
      });
    } catch (err) {
      console.error('prisma db push failed:', String(err));
      throw err;
    }

    // 4. Set DATABASE_URL to test DB
    process.env.DATABASE_URL = TEST_DB_URL;

    // 5. Create NestJS TestingModule with PrismaService using libsql adapter
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useFactory({
        factory: () => {
          const adapter = new PrismaLibSql({ url: TEST_DB_URL });
          return new PrismaService(adapter);
        },
      })
      .compile();

    // 6. Create app
    app = moduleFixture.createNestApplication();

    // 7. Apply global prefix
    app.setGlobalPrefix('api');

    // 8. Apply ValidationPipe (mirrors main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // 9. Initialize app
    await app.init();

    // 10. Get PrismaService
    prisma = app.get(PrismaService);

    // 11. Seed minimal fixtures
    await prisma.farm.create({
      data: {
        id: 'farm-001',
        name: 'Fazenda Boa Esperança',
        producer: 'João Silva',
        phone: '+5535999999999',
      },
    });

    const devices = [
      { id: 'sensor-temp-01', type: 'AIR_TEMPERATURE', label: 'Ambient temperature sensor' },
      { id: 'sensor-humidity-01', type: 'AIR_HUMIDITY', label: 'Air humidity sensor' },
      { id: 'sensor-soil-01', type: 'SOIL_MOISTURE', label: 'Soil moisture sensor' },
      { id: 'reservoir-sensor-01', type: 'WATER_RESERVOIR_LEVEL', label: 'Water reservoir level sensor' },
      { id: 'silo-sensor-01', type: 'SILO_LEVEL', label: 'Silo level sensor' },
      { id: 'irrigation-pump-01', type: 'EQUIPMENT_STATUS', label: 'Irrigation pump' },
    ];

    for (const device of devices) {
      await prisma.device.create({
        data: {
          id: device.id,
          farmId: 'farm-001',
          type: device.type,
          label: device.label,
        },
      });
    }
  });

  afterAll(async () => {
    // 1. Disconnect prisma
    if (prisma) {
      await prisma.$disconnect();
    }

    // 2. Close app
    if (app) {
      await app.close();
    }

    // 3. Restore original DATABASE_URL
    if (originalDatabaseUrl !== undefined) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }

    // 4. Delete test.db files
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    const journalPath = `${TEST_DB_PATH}-journal`;
    if (fs.existsSync(journalPath)) {
      fs.unlinkSync(journalPath);
    }
  });

  // ── AC-1: Valid sensor events ──────────────────────────────────
  describe('POST /api/events — valid events', () => {
    it('should accept a valid sensor event (AIR_TEMPERATURE) and return 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-temp-01',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 27.0,
          unit: 'C',
          timestamp: '2026-08-17T14:30:00-03:00',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('e2e-temp-01');
      expect(res.body.value).toBe(27.0);
      expect(res.body.type).toBe('AIR_TEMPERATURE');
      expect(res.body).toHaveProperty('receivedAt');
    });

    it('should accept a valid sensor event (AIR_HUMIDITY) and return 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-hum-01',
          farmId: 'farm-001',
          deviceId: 'sensor-humidity-01',
          type: 'AIR_HUMIDITY',
          value: 65,
          unit: '%',
          timestamp: '2026-08-17T14:31:00-03:00',
        });

      expect(res.status).toBe(201);
      expect(res.body.value).toBe(65);
    });
  });

  // ── AC-2: Valid EQUIPMENT_STATUS ──────────────────────────────────
  describe('POST /api/events — EQUIPMENT_STATUS', () => {
    it('should accept EQUIPMENT_STATUS with string value FAILURE', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-eq-01',
          farmId: 'farm-001',
          deviceId: 'irrigation-pump-01',
          type: 'EQUIPMENT_STATUS',
          value: 'FAILURE',
          unit: null,
          timestamp: '2026-08-17T14:35:00-03:00',
        });

      expect(res.status).toBe(201);
      expect(res.body.textValue).toBe('FAILURE');
    });
  });

  // ── AC-3 (S9–S15): Invalid variants ────────────────────────────────
  describe('POST /api/events — invalid events', () => {
    // S9: missing eventId
    it('should reject missing eventId (S9)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 25,
          unit: 'C',
          timestamp: '2026-08-17T14:30:00-03:00',
        });

      expect(res.status).toBe(400);
      expect(Array.isArray(res.body.message)).toBe(true);
      expect(res.body.message.some((m: string) => m.toLowerCase().includes('eventid'))).toBe(true);
    });

    // S10: unknown deviceId
    it('should reject unknown deviceId (S10)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-inv-dev',
          farmId: 'farm-001',
          deviceId: 'device-unknown',
          type: 'SOIL_MOISTURE',
          value: 50,
          unit: '%',
          timestamp: '2026-08-17T14:30:00-03:00',
        });

      expect(res.status).toBe(400);

      // Verify not persisted
      const getRes = await request(app.getHttpServer())
        .get('/api/events/e2e-inv-dev');
      expect(getRes.status).toBe(404);
    });

    // S11: unknown type
    it('should reject unknown event type (S11)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-inv-type',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'UNKNOWN_TYPE',
          value: 25,
          unit: 'C',
          timestamp: '2026-08-17T14:30:00-03:00',
        });

      expect(res.status).toBe(400);

      // Verify not persisted
      const getRes = await request(app.getHttpServer())
        .get('/api/events/e2e-inv-type');
      expect(getRes.status).toBe(404);
    });

    // S12: AIR_HUMIDITY out of range (130 > 100)
    it('should reject AIR_HUMIDITY = 130 (out of range, S12)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-inv-range',
          farmId: 'farm-001',
          deviceId: 'sensor-humidity-01',
          type: 'AIR_HUMIDITY',
          value: 130,
          unit: '%',
          timestamp: '2026-08-17T14:30:00-03:00',
        });

      expect(res.status).toBe(400);

      // Verify not persisted
      const getRes = await request(app.getHttpServer())
        .get('/api/events/e2e-inv-range');
      expect(getRes.status).toBe(404);
    });

    // S13: AIR_TEMPERATURE with wrong unit
    it('should reject AIR_TEMPERATURE with unit "%" (S13)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-inv-unit',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 27,
          unit: '%',
          timestamp: '2026-08-17T14:30:00-03:00',
        });

      expect(res.status).toBe(400);

      // Verify not persisted
      const getRes = await request(app.getHttpServer())
        .get('/api/events/e2e-inv-unit');
      expect(getRes.status).toBe(404);
    });

    // S14: invalid timestamp
    it('should reject invalid timestamp format (S14)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-inv-ts',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 27,
          unit: 'C',
          timestamp: 'not-a-timestamp',
        });

      expect(res.status).toBe(400);

      // Verify not persisted
      const getRes = await request(app.getHttpServer())
        .get('/api/events/e2e-inv-ts');
      expect(getRes.status).toBe(404);
    });

    // S15: EQUIPMENT_STATUS with numeric value
    it('should reject EQUIPMENT_STATUS with numeric value (S15)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-inv-eq',
          farmId: 'farm-001',
          deviceId: 'irrigation-pump-01',
          type: 'EQUIPMENT_STATUS',
          value: 123,
          unit: null,
          timestamp: '2026-08-17T14:35:00-03:00',
        });

      expect(res.status).toBe(400);

      // Verify not persisted
      const getRes = await request(app.getHttpServer())
        .get('/api/events/e2e-inv-eq');
      expect(getRes.status).toBe(404);
    });
  });

  // ── AC-4 (S16): Duplicate idempotency ────────────────────────────────
  describe('POST /api/events — idempotency', () => {
    it('should return 200 with duplicate:true for an already-processed eventId (S16)', async () => {
      // Step 1: Post valid event
      const res1 = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-dup-01',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 28,
          unit: 'C',
          timestamp: '2026-08-17T14:30:00-03:00',
        });

      expect(res1.status).toBe(201);

      // Step 2: Post exact same event again
      const res2 = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-dup-01',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 28,
          unit: 'C',
          timestamp: '2026-08-17T14:30:00-03:00',
        });

      expect(res2.status).toBe(200);
      expect(res2.body.duplicate).toBe(true);
      expect(res2.body.id).toBe('e2e-dup-01');

      // Verify exactly 1 row in DB
      const dbCount = await prisma.event.count({ where: { id: 'e2e-dup-01' } });
      expect(dbCount).toBe(1);
    });
  });

  // ── AC-5: List / filter / pagination ──────────────────────────────────
  describe('GET /api/events — list, filter, pagination', () => {
    beforeAll(async () => {
      // Seed events via POST
      await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'event-503',
          farmId: 'farm-001',
          deviceId: 'sensor-soil-01',
          type: 'SOIL_MOISTURE',
          value: 50,
          unit: '%',
          timestamp: '2026-08-19T08:00:00-03:00',
        });

      await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'event-502',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 30,
          unit: 'C',
          timestamp: '2026-08-19T09:00:00-03:00',
        });

      await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'event-501',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 25,
          unit: 'C',
          timestamp: '2026-08-19T10:00:00-03:00',
        });
    });

    it('should return all events ordered by timestamp desc', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/events?limit=50&offset=0');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.total).toBeGreaterThanOrEqual(3);

      // First element should be the newest timestamp
      const timestamps: number[] = res.body.data.map(
        (e: { timestamp: string }) => new Date(e.timestamp).getTime(),
      );
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i - 1]).toBeGreaterThanOrEqual(timestamps[i]);
      }
    });

    it('should filter by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/events?type=AIR_TEMPERATURE');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const event of res.body.data) {
        expect(event.type).toBe('AIR_TEMPERATURE');
      }
    });

    it('should support pagination (limit + offset)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/events?limit=1&offset=0');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });
  });

  // ── AC-6: 404 for unknown event ──────────────────────────────────────
  describe('GET /api/events/:id — not found', () => {
    it('should return 404 for unknown event id', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/events/nonexistent-id-xyz');

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });
});