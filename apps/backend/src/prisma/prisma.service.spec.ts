import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

// Mock $connect before importing the class that extends PrismaClient
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.$connect = mockConnect;
    this.$disconnect = mockDisconnect;
  }),
}));

jest.mock('@prisma/adapter-libsql', () => ({
  PrismaLibSql: jest.fn().mockImplementation(function () {
    return {};
  }),
}));

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();
    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $connect on module init', async () => {
    await service.onModuleInit();
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('should have $disconnect available for shutdown hooks', () => {
    expect(service.$disconnect).toBeDefined();
    expect(typeof service.$disconnect).toBe('function');
  });
});
