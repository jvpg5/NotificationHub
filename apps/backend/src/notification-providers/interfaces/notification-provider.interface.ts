export interface SendResult {
  ok: boolean;
  error?: string;
}

export interface NotificationPayload {
  recipient: string;
  message: string;
}

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<SendResult>;
}