import { Module } from '@nestjs/common';
import { MockWhatsAppProvider } from './providers/mock-whatsapp.provider';

export const NOTIFICATION_PROVIDER = 'NOTIFICATION_PROVIDER';

@Module({
  providers: [
    {
      provide: NOTIFICATION_PROVIDER,
      useClass: MockWhatsAppProvider,
    },
  ],
  exports: [NOTIFICATION_PROVIDER],
})
export class NotificationProvidersModule {}