import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

describe('DevicesController', () => {
  let controller: DevicesController;
  const mockDevices = [
    { id: 'sensor-temp-01', farmId: 'farm-001', type: 'AIR_TEMPERATURE', label: 'Ambient temperature sensor' },
    { id: 'sensor-humidity-01', farmId: 'farm-001', type: 'AIR_HUMIDITY', label: 'Air humidity sensor' },
    { id: 'sensor-soil-01', farmId: 'farm-001', type: 'SOIL_MOISTURE', label: 'Soil moisture sensor' },
    { id: 'reservoir-sensor-01', farmId: 'farm-001', type: 'WATER_RESERVOIR_LEVEL', label: 'Water reservoir level sensor' },
    { id: 'silo-sensor-01', farmId: 'farm-001', type: 'SILO_LEVEL', label: 'Silo level sensor' },
    { id: 'irrigation-pump-01', farmId: 'farm-001', type: 'EQUIPMENT_STATUS', label: 'Irrigation pump' },
  ];
  const devicesService = {
    findAll: jest.fn().mockResolvedValue(mockDevices),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [{ provide: DevicesService, useValue: devicesService }],
    }).compile();

    controller = module.get<DevicesController>(DevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return devices wrapped in data', async () => {
    const result = await controller.findAll();
    expect(result).toEqual({ data: mockDevices });
    expect(devicesService.findAll).toHaveBeenCalledTimes(1);
  });
});