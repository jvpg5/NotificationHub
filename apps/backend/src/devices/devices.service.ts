import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<
    { id: string; farmId: string; type: string; label: string }[]
  > {
    return await this.prisma.device.findMany({
      select: { id: true, farmId: true, type: true, label: true },
    });
  }
}