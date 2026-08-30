import { Test, TestingModule } from '@nestjs/testing';
import { FarmService } from './farm.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FarmService', () => {
  let service: FarmService;
  const mockFarm = {
    id: 'farm-001',
    name: 'Fazenda Boa Esperança',
    producer: 'João Silva',
    phone: '+5535999999999',
  };
  const prisma = {
    farm: {
      findFirst: jest.fn().mockResolvedValue(mockFarm),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FarmService>(FarmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the farm', async () => {
    const result = await service.getFarm();
    expect(result).toEqual(mockFarm);
    expect(prisma.farm.findFirst).toHaveBeenCalledTimes(1);
  });
});