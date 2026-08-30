import { Injectable } from '@nestjs/common';
import {
  NotificationProvider,
  NotificationPayload,
  SendResult,
} from '../interfaces/notification-provider.interface';

@Injectable()
export class MockWhatsAppProvider implements NotificationProvider {
  async send(payload: NotificationPayload): Promise<SendResult> {
    console.log(`[MockWhatsApp] → ${payload.recipient}: ${payload.message}`);
    return { ok: true };
  }
}

@Injectable()
export class FailingWhatsAppProvider implements NotificationProvider {
  async send(_payload: NotificationPayload): Promise<SendResult> {
    return { ok: false, error: 'Simulated delivery failure' };
  }
}