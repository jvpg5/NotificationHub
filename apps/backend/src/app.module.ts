import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsModule } from './events/events.module';
import { DevicesModule } from './devices/devices.module';
import { FarmModule } from './farm/farm.module';
import { PrismaModule } from './prisma/prisma.module';

import { RulesModule } from './rules/rules.module';

@Module({
  imports: [PrismaModule, EventsModule, FarmModule, DevicesModule, RulesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}