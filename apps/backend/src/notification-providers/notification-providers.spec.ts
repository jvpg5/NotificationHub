import { Test, TestingModule } from '@nestjs/testing';
import {
  NotificationProvidersModule,
  NOTIFICATION_PROVIDER,
} from './notification-providers.module';
import { NotificationProvider } from './interfaces/notification-provider.interface';
import { FailingWhatsAppProvider } from './providers/mock-whatsapp.provider';

describe('NotificationProviders', () => {
  describe('MockWhatsAppProvider', () => {
    let provider: NotificationProvider;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [NotificationProvidersModule],
      }).compile();
      provider = module.get<NotificationProvider>(NOTIFICATION_PROVIDER);
    });

    it('should be injectable via token', () => {
      expect(provider).toBeDefined();
    });

    it('should log recipient and message, return { ok: true }', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = await provider.send({
        recipient: '+5535999999999',
        message: 'Test message',
      });
      expect(result).toEqual({ ok: true });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[MockWhatsApp] → +5535999999999: Test message',
      );
      consoleSpy.mockRestore();
    });
  });

  describe('FailingWhatsAppProvider', () => {
    let provider: NotificationProvider;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          { provide: NOTIFICATION_PROVIDER, useClass: FailingWhatsAppProvider },
        ],
      }).compile();
      provider = module.get<NotificationProvider>(NOTIFICATION_PROVIDER);
    });

    it('should return { ok: false } with error message', async () => {
      const result = await provider.send({
        recipient: '+5535999999999',
        message: 'Test',
      });
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Simulated delivery failure');
    });
  });
});