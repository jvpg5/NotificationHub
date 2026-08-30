import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationProvidersModule } from '../notification-providers/notification-providers.module';

@Module({
  imports: [NotificationProvidersModule],
  providers: [NotificationsService],
})
export class NotificationsModule {}