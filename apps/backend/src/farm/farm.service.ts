import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FarmService {
  constructor(private readonly prisma: PrismaService) {}

  async getFarm(): Promise<{
    id: string;
    name: string;
    producer: string;
    phone: string;
  } | null> {
    return await this.prisma.farm.findFirst();
  }
}