import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FarmModule } from './farm/farm.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, FarmModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}