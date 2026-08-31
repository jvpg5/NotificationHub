import { Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(@Optional() adapter?: PrismaLibSql) {
    const resolvedAdapter =
      adapter ?? new PrismaLibSql({ url: process.env.DATABASE_URL! });
    super({ adapter: resolvedAdapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
