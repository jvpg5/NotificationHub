import { Test, TestingModule } from '@nestjs/testing';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';

describe('FarmController', () => {
  let controller: FarmController;
  const mockFarm = {
    id: 'farm-001',
    name: 'Fazenda Boa Esperança',
    producer: 'João Silva',
    phone: '+5535999999999',
  };
  const farmService = {
    getFarm: jest.fn().mockResolvedValue(mockFarm),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmController],
      providers: [{ provide: FarmService, useValue: farmService }],
    }).compile();

    controller = module.get<FarmController>(FarmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the farm', async () => {
    const result = await controller.getFarm();
    expect(result).toEqual(mockFarm);
    expect(farmService.getFarm).toHaveBeenCalledTimes(1);
  });
});