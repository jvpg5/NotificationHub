import { EventType, Severity, NotificationStatus } from './enums';

export interface CreateEventDto {
  eventId: string;
  farmId: string;
  deviceId: string;
  type: EventType;
  value: number | string;
  unit: string;
  timestamp: string;
}

export interface EventResponse {
  id: string;
  farmId: string;
  deviceId: string;
  type: EventType;
  value: number | null;
  textValue: string | null;
  unit: string;
  timestamp: string;
  receivedAt: string;
}

export interface NotificationResponse {
  id: string;
  eventId: string;
  farmId: string;
  deviceId: string;
  eventType: EventType;
  eventValue: number | string;
  ruleTriggered: string;
  severity: Severity;
  message: string;
  status: NotificationStatus;
  sentAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FarmResponse {
  id: string;
  name: string;
  producer: string;
  phone: string;
}

export interface DeviceResponse {
  id: string;
  farmId: string;
  type: EventType;
  label: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}