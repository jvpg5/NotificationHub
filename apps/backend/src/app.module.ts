import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DevicesModule } from './devices/devices.module';
import { FarmModule } from './farm/farm.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, FarmModule, DevicesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}