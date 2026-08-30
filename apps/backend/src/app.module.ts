import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsModule } from './events/events.module';
import { DevicesModule } from './devices/devices.module';
import { FarmModule } from './farm/farm.module';
import { PrismaModule } from './prisma/prisma.module';

import { RulesModule } from './rules/rules.module';
import { NotificationProvidersModule } from './notification-providers/notification-providers.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    FarmModule,
    DevicesModule,
    RulesModule,
    NotificationProvidersModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}