import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

async function main() {
  const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' });
  const prisma = new PrismaClient({ adapter });

  // Upsert farm
  await prisma.farm.upsert({
    where: { id: 'farm-001' },
    update: {},
    create: {
      id: 'farm-001',
      name: 'Fazenda Boa Esperança',
      producer: 'João Silva',
      phone: '+5535999999999',
    },
  });

  // Upsert devices
  const devices = [
    { id: 'sensor-temp-01', type: 'AIR_TEMPERATURE', label: 'Ambient temperature sensor' },
    { id: 'sensor-humidity-01', type: 'AIR_HUMIDITY', label: 'Air humidity sensor' },
    { id: 'sensor-soil-01', type: 'SOIL_MOISTURE', label: 'Soil moisture sensor' },
    { id: 'reservoir-sensor-01', type: 'WATER_RESERVOIR_LEVEL', label: 'Water reservoir level sensor' },
    { id: 'silo-sensor-01', type: 'SILO_LEVEL', label: 'Silo level sensor' },
    { id: 'irrigation-pump-01', type: 'EQUIPMENT_STATUS', label: 'Irrigation pump' },
  ];

  for (const device of devices) {
    await prisma.device.upsert({
      where: { id: device.id },
      update: {},
      create: {
        id: device.id,
        farmId: 'farm-001',
        type: device.type,
        label: device.label,
      },
    });
  }

  // Upsert demo events (only when SEED_DEMO_EVENTS=true)
  if (process.env.SEED_DEMO_EVENTS === 'true') {
    const demoEvents = [
      { id: 'event-001', deviceId: 'sensor-temp-01', type: 'AIR_TEMPERATURE', value: 38.5, textValue: null, unit: 'C', timestamp: '2026-08-17T14:30:00-03:00' },
      { id: 'event-002', deviceId: 'sensor-humidity-01', type: 'AIR_HUMIDITY', value: 24, textValue: null, unit: '%', timestamp: '2026-08-17T14:31:00-03:00' },
      { id: 'event-003', deviceId: 'sensor-soil-01', type: 'SOIL_MOISTURE', value: 17, textValue: null, unit: '%', timestamp: '2026-08-17T14:32:00-03:00' },
      { id: 'event-004', deviceId: 'reservoir-sensor-01', type: 'WATER_RESERVOIR_LEVEL', value: 12, textValue: null, unit: '%', timestamp: '2026-08-17T14:33:00-03:00' },
      { id: 'event-005', deviceId: 'silo-sensor-01', type: 'SILO_LEVEL', value: 10, textValue: null, unit: '%', timestamp: '2026-08-17T14:34:00-03:00' },
      { id: 'event-006', deviceId: 'irrigation-pump-01', type: 'EQUIPMENT_STATUS', value: null, textValue: 'FAILURE', unit: null, timestamp: '2026-08-17T14:35:00-03:00' },
      { id: 'event-007', deviceId: 'sensor-temp-01', type: 'AIR_TEMPERATURE', value: 27, textValue: null, unit: 'C', timestamp: '2026-08-17T14:36:00-03:00' },
    ];

    for (const event of demoEvents) {
      await prisma.event.upsert({
        where: { id: event.id },
        update: {},
        create: {
          id: event.id,
          farmId: 'farm-001',
          deviceId: event.deviceId,
          type: event.type,
          value: event.value,
          textValue: event.textValue,
          unit: event.unit,
          timestamp: new Date(event.timestamp),
        },
      });
    }
  }

  console.log('Seed completed successfully.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});