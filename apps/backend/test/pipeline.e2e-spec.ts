/**
 * Pipeline e2e tests — T-020
 *
 * Full-flow: POST /api/events → rule evaluation → notification persisted → sent.
 * Uses real HTTP + real (in-memory) DB through supertest + NestJS testing module.
 *
 * Covers: S1–S8, S16, S17
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { NotificationsService } from '../src/notifications/notifications.service';
import {
  NOTIFICATION_PROVIDER,
} from '../src/notification-providers/notification-providers.module';
import { FailingWhatsAppProvider } from '../src/notification-providers/providers/mock-whatsapp.provider';

// ── Helpers ─────────────────────────────────────────────────────────────────

const wait = (ms = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function getNotificationsForEvent(
  prisma: PrismaService,
  eventId: string,
) {
  return prisma.notification.findMany({ where: { eventId } });
}

// ── Seed data ───────────────────────────────────────────────────────────────

const SEED_TIMESTAMP = '2026-08-30T10:00:00-03:00';

const FARM = {
  id: 'farm-001',
  name: 'Fazenda Boa Esperança',
  producer: 'João Silva',
  phone: '+5535999999999',
};

const DEVICES = [
  { id: 'sensor-temp-01', type: 'AIR_TEMPERATURE', label: 'Ambient temperature sensor' },
  { id: 'sensor-humidity-01', type: 'AIR_HUMIDITY', label: 'Air humidity sensor' },
  { id: 'sensor-soil-01', type: 'SOIL_MOISTURE', label: 'Soil moisture sensor' },
  { id: 'reservoir-sensor-01', type: 'WATER_RESERVOIR_LEVEL', label: 'Water reservoir level sensor' },
  { id: 'silo-sensor-01', type: 'SILO_LEVEL', label: 'Silo level sensor' },
  { id: 'irrigation-pump-01', type: 'EQUIPMENT_STATUS', label: 'Irrigation pump' },
];

// ── DDL ─────────────────────────────────────────────────────────────────────

function loadMigrationStatements(): string[] {
  const migrationPath = path.resolve(
    __dirname,
    '..',
    'prisma',
    'migrations',
    '20260830172057_init',
    'migration.sql',
  );
  const raw = fs.readFileSync(migrationPath, 'utf8');
  return raw
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s + ';');
}

// ── Helper: create the test app ─────────────────────────────────────────────

async function createTestApp(options?: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notificationProvider?: any;
}): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const adapter = new PrismaLibSql({ url: 'file::memory:' });
  const testPrisma = new PrismaService({ adapter });

  // Run migration
  const statements = loadMigrationStatements();
  for (const stmt of statements) {
    await testPrisma.$executeRawUnsafe(stmt);
  }

  // Seed farm + devices
  await testPrisma.farm.create({ data: FARM });
  for (const device of DEVICES) {
    await testPrisma.device.create({
      data: {
        id: device.id,
        farmId: 'farm-001',
        type: device.type,
        label: device.label,
      },
    });
  }

  // Build TestingModule
  const builder = Test.createTestingModule({
    imports: [AppModule],
  }).overrideProvider(PrismaService).useValue(testPrisma);

  if (options?.notificationProvider) {
    builder
      .overrideProvider(NOTIFICATION_PROVIDER)
      .useClass(options.notificationProvider);
  }

  const moduleFixture: TestingModule = await builder.compile();
  const app = moduleFixture.createNestApplication();

  // Replicate main.ts setup
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  return { app, prisma: testPrisma };
}

// ── Suite ───────────────────────────────────────────────────────────────────

describe('Pipeline e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const result = await createTestApp();
    app = result.app;
    prisma = result.prisma;
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    // Clean events + notifications between tests (foreign-key order)
    await prisma.notification.deleteMany();
    await prisma.event.deleteMany();
  });

  // ── S2: AIR_TEMPERATURE_HIGH ──────────────────────────────────────────────
  describe('Alert scenarios', () => {
    it('S2: AIR_TEMPERATURE=38.5 → AIR_TEMPERATURE_HIGH, WARNING', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s2',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 38.5,
          unit: 'C',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('e2e-s2');

      await wait();

      const notifications = await getNotificationsForEvent(prisma, 'e2e-s2');
      expect(notifications).toHaveLength(1);
      const n = notifications[0];
      expect(n.ruleTriggered).toBe('AIR_TEMPERATURE_HIGH');
      expect(n.severity).toBe('WARNING');
      expect(n.message).toBe(
        '⚠️ Temperature alert: 38.5°C recorded by sensor sensor-temp-01 at Fazenda Boa Esperança.',
      );
      expect(n.status).toBe('SENT');
      expect(n.sentAt).toBeTruthy();
      expect(n.failureReason).toBeNull();
    });

    // ── S3: AIR_HUMIDITY_LOW ────────────────────────────────────────────────
    it('S3: AIR_HUMIDITY=24 → AIR_HUMIDITY_LOW, INFO', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s3',
          farmId: 'farm-001',
          deviceId: 'sensor-humidity-01',
          type: 'AIR_HUMIDITY',
          value: 24,
          unit: '%',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);

      await wait();

      const notifications = await getNotificationsForEvent(prisma, 'e2e-s3');
      expect(notifications).toHaveLength(1);
      const n = notifications[0];
      expect(n.ruleTriggered).toBe('AIR_HUMIDITY_LOW');
      expect(n.severity).toBe('INFO');
      expect(n.message).toBe(
        '⚠️ Low humidity alert: air humidity reached 24% at Fazenda Boa Esperança.',
      );
      expect(n.status).toBe('SENT');
      expect(n.sentAt).toBeTruthy();
      expect(n.failureReason).toBeNull();
    });

    // ── S4: SOIL_MOISTURE_LOW ───────────────────────────────────────────────
    it('S4: SOIL_MOISTURE=17 → SOIL_MOISTURE_LOW, INFO', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s4',
          farmId: 'farm-001',
          deviceId: 'sensor-soil-01',
          type: 'SOIL_MOISTURE',
          value: 17,
          unit: '%',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);

      await wait();

      const notifications = await getNotificationsForEvent(prisma, 'e2e-s4');
      expect(notifications).toHaveLength(1);
      const n = notifications[0];
      expect(n.ruleTriggered).toBe('SOIL_MOISTURE_LOW');
      expect(n.severity).toBe('INFO');
      expect(n.message).toBe(
        '💧 Irrigation alert: soil moisture is at 17%. Check irrigation needs.',
      );
      expect(n.status).toBe('SENT');
      expect(n.sentAt).toBeTruthy();
      expect(n.failureReason).toBeNull();
    });

    // ── S5: WATER_RESERVOIR_LOW ─────────────────────────────────────────────
    it('S5: WATER_RESERVOIR_LEVEL=12 → WATER_RESERVOIR_LOW, WARNING', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s5',
          farmId: 'farm-001',
          deviceId: 'reservoir-sensor-01',
          type: 'WATER_RESERVOIR_LEVEL',
          value: 12,
          unit: '%',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);

      await wait();

      const notifications = await getNotificationsForEvent(prisma, 'e2e-s5');
      expect(notifications).toHaveLength(1);
      const n = notifications[0];
      expect(n.ruleTriggered).toBe('WATER_RESERVOIR_LOW');
      expect(n.severity).toBe('WARNING');
      expect(n.message).toBe(
        '💧 Low water level: the reservoir is at only 12% of capacity.',
      );
      expect(n.status).toBe('SENT');
      expect(n.sentAt).toBeTruthy();
      expect(n.failureReason).toBeNull();
    });

    // ── S6: SILO_LEVEL_LOW ──────────────────────────────────────────────────
    it('S6: SILO_LEVEL=10 → SILO_LEVEL_LOW, WARNING', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s6',
          farmId: 'farm-001',
          deviceId: 'silo-sensor-01',
          type: 'SILO_LEVEL',
          value: 10,
          unit: '%',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);

      await wait();

      const notifications = await getNotificationsForEvent(prisma, 'e2e-s6');
      expect(notifications).toHaveLength(1);
      const n = notifications[0];
      expect(n.ruleTriggered).toBe('SILO_LEVEL_LOW');
      expect(n.severity).toBe('WARNING');
      expect(n.message).toBe(
        '⚠️ Low silo level: the silo monitored by silo-sensor-01 is at 10% of capacity.',
      );
      expect(n.status).toBe('SENT');
      expect(n.sentAt).toBeTruthy();
      expect(n.failureReason).toBeNull();
    });

    // ── S7: EQUIPMENT_FAILURE ───────────────────────────────────────────────
    it('S7: EQUIPMENT_STATUS=FAILURE → EQUIPMENT_FAILURE, CRITICAL', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s7',
          farmId: 'farm-001',
          deviceId: 'irrigation-pump-01',
          type: 'EQUIPMENT_STATUS',
          value: 'FAILURE',
          unit: null,
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);

      await wait();

      const notifications = await getNotificationsForEvent(prisma, 'e2e-s7');
      expect(notifications).toHaveLength(1);
      const n = notifications[0];
      expect(n.ruleTriggered).toBe('EQUIPMENT_FAILURE');
      expect(n.severity).toBe('CRITICAL');
      expect(n.message).toBe(
        '🚨 Equipment failure: a failure was detected on equipment irrigation-pump-01.',
      );
      expect(n.status).toBe('SENT');
      expect(n.sentAt).toBeTruthy();
      expect(n.failureReason).toBeNull();
    });
  });

  // ── S1: Normal reading ────────────────────────────────────────────────────
  describe('Normal reading (S1)', () => {
    it('AIR_TEMPERATURE=27 → no notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s1',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 27,
          unit: 'C',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);

      await wait();

      const notifications = await getNotificationsForEvent(prisma, 'e2e-s1');
      expect(notifications).toHaveLength(0);
    });
  });

  // ── S8: Boundary values ───────────────────────────────────────────────────
  describe('Boundary values (S8)', () => {
    it('AIR_TEMPERATURE=35.0 → no notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s8-1',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 35.0,
          unit: 'C',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);
      await wait();
      const notifications = await getNotificationsForEvent(prisma, 'e2e-s8-1');
      expect(notifications).toHaveLength(0);
    });

    it('AIR_HUMIDITY=30.0 → no notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s8-2',
          farmId: 'farm-001',
          deviceId: 'sensor-humidity-01',
          type: 'AIR_HUMIDITY',
          value: 30.0,
          unit: '%',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);
      await wait();
      const notifications = await getNotificationsForEvent(prisma, 'e2e-s8-2');
      expect(notifications).toHaveLength(0);
    });

    it('SOIL_MOISTURE=20.0 → no notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s8-3',
          farmId: 'farm-001',
          deviceId: 'sensor-soil-01',
          type: 'SOIL_MOISTURE',
          value: 20.0,
          unit: '%',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);
      await wait();
      const notifications = await getNotificationsForEvent(prisma, 'e2e-s8-3');
      expect(notifications).toHaveLength(0);
    });

    it('WATER_RESERVOIR_LEVEL=15.0 → no notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s8-4',
          farmId: 'farm-001',
          deviceId: 'reservoir-sensor-01',
          type: 'WATER_RESERVOIR_LEVEL',
          value: 15.0,
          unit: '%',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);
      await wait();
      const notifications = await getNotificationsForEvent(prisma, 'e2e-s8-4');
      expect(notifications).toHaveLength(0);
    });

    it('SILO_LEVEL=15.0 → no notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s8-5',
          farmId: 'farm-001',
          deviceId: 'silo-sensor-01',
          type: 'SILO_LEVEL',
          value: 15.0,
          unit: '%',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);
      await wait();
      const notifications = await getNotificationsForEvent(prisma, 'e2e-s8-5');
      expect(notifications).toHaveLength(0);
    });

    it('EQUIPMENT_STATUS=OK → no notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s8-ok',
          farmId: 'farm-001',
          deviceId: 'irrigation-pump-01',
          type: 'EQUIPMENT_STATUS',
          value: 'OK',
          unit: null,
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);
      await wait();
      const notifications = await getNotificationsForEvent(prisma, 'e2e-s8-ok');
      expect(notifications).toHaveLength(0);
    });

    it('EQUIPMENT_STATUS=MAINTENANCE → no notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s8-maint',
          farmId: 'farm-001',
          deviceId: 'irrigation-pump-01',
          type: 'EQUIPMENT_STATUS',
          value: 'MAINTENANCE',
          unit: null,
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);
      await wait();
      const notifications = await getNotificationsForEvent(prisma, 'e2e-s8-maint');
      expect(notifications).toHaveLength(0);
    });
  });

  // ── S16: Duplicate idempotency ────────────────────────────────────────────
  describe('Duplicate event (S16)', () => {
    it('should not create a second notification for duplicate eventId', async () => {
      // First POST
      const res1 = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s16',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 38.5,
          unit: 'C',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res1.status).toBe(201);
      await wait(400);

      // Should have 1 notification
      const notificationsBefore = await getNotificationsForEvent(prisma, 'e2e-s16');
      expect(notificationsBefore).toHaveLength(1);

      // Duplicate POST
      const res2 = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s16',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 38.5,
          unit: 'C',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res2.status).toBe(200);
      expect(res2.body.duplicate).toBe(true);
      expect(res2.body.id).toBe('e2e-s16');

      await wait();

      // Notification count should still be 1
      const notificationsAfter = await getNotificationsForEvent(prisma, 'e2e-s16');
      expect(notificationsAfter).toHaveLength(1);
    });
  });

  // ── S17: Failing provider ─────────────────────────────────────────────────
  // Uses the main app but overrides NOTIFICATION_PROVIDER via the DI container.
  // Creating a separate TestingModule is unreliable because NestJS may
  // deduplicate global providers (EventEmitter2) across app instances.
  describe('Failing provider (S17)', () => {
    it('should set notification status to FAILED with failureReason', async () => {
      // Get NotificationsService and swap its provider to FailingWhatsAppProvider
      const notificationsService = app.get(NotificationsService);
      // `provider` is private readonly — access via double-assertion
      const svc = notificationsService as unknown as Record<string, unknown>;
      const originalProvider = svc['provider'];
      svc['provider'] = new FailingWhatsAppProvider();

      const res = await request(app.getHttpServer())
        .post('/api/events')
        .send({
          eventId: 'e2e-s17',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          type: 'AIR_TEMPERATURE',
          value: 38.5,
          unit: 'C',
          timestamp: SEED_TIMESTAMP,
        });

      expect(res.status).toBe(201);

      await wait();

      const notifications = await getNotificationsForEvent(prisma, 'e2e-s17');
      expect(notifications).toHaveLength(1);
      const n = notifications[0];
      expect(n.status).toBe('FAILED');
      expect(n.failureReason).toBe('Simulated delivery failure');
      expect(n.sentAt).toBeNull();

      // Restore original provider
      svc['provider'] = originalProvider;
    });
  });
});