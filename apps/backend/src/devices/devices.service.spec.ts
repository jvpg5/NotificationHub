import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DevicesService', () => {
  let service: DevicesService;
  const mockDevices = [
    { id: 'sensor-temp-01', farmId: 'farm-001', type: 'AIR_TEMPERATURE', label: 'Ambient temperature sensor' },
    { id: 'sensor-humidity-01', farmId: 'farm-001', type: 'AIR_HUMIDITY', label: 'Air humidity sensor' },
    { id: 'sensor-soil-01', farmId: 'farm-001', type: 'SOIL_MOISTURE', label: 'Soil moisture sensor' },
    { id: 'reservoir-sensor-01', farmId: 'farm-001', type: 'WATER_RESERVOIR_LEVEL', label: 'Water reservoir level sensor' },
    { id: 'silo-sensor-01', farmId: 'farm-001', type: 'SILO_LEVEL', label: 'Silo level sensor' },
    { id: 'irrigation-pump-01', farmId: 'farm-001', type: 'EQUIPMENT_STATUS', label: 'Irrigation pump' },
  ];
  const prisma = {
    device: {
      findMany: jest.fn().mockResolvedValue(mockDevices),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all devices', async () => {
    const result = await service.findAll();
    expect(result).toEqual(mockDevices);
    expect(prisma.device.findMany).toHaveBeenCalledTimes(1);
  });
});