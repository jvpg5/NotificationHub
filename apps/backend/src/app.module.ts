import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsModule } from './events/events.module';
import { FarmModule } from './farm/farm.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, EventsModule, FarmModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}