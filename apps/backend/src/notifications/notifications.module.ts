import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationProvidersModule } from '../notification-providers/notification-providers.module';

@Module({
  imports: [NotificationProvidersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}