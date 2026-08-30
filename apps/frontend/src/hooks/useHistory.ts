import { useQuery } from '@tanstack/react-query';
import { listEvents, listNotifications } from '../services/api';
import type { EventType, NotificationStatus, Severity } from 'shared-types';
import type { NotificationResponse } from 'shared-types';

export interface HistoryRow {
  eventId: string;
  deviceId: string;
  type: string;
  value: string | number;
  timestamp: string;
  ruleTriggered: string | null;
  severity: string | null;
  message: string | null;
  status: string | null;
  sentAt: string | null;
  failureReason: string | null;
}

export function useHistory(params?: {
  limit?: number;
  offset?: number;
  type?: EventType;
  status?: NotificationStatus;
  severity?: Severity;
}) {
  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsIsError,
    error: eventsError,
  } = useQuery({
    queryKey: ['events', { limit: params?.limit, offset: params?.offset, type: params?.type }],
    queryFn: () => listEvents({ limit: params?.limit, offset: params?.offset, type: params?.type }),
  });

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    isError: notificationsIsError,
    error: notificationsError,
  } = useQuery({
    queryKey: ['notifications', { limit: 1000 }],
    queryFn: () => listNotifications({ limit: 1000 }),
  });

  const events = eventsData?.data ?? [];
  const notifications = notificationsData?.data ?? [];

  // Build a Map of eventId → NotificationResponse
  const notificationByEventId = new Map<string, NotificationResponse>();
  for (const n of notifications) {
    notificationByEventId.set(n.eventId, n);
  }

  // Join events to notifications
  let rows: HistoryRow[] = events.map((event) => {
    const notification = notificationByEventId.get(event.id);

    return {
      eventId: event.id,
      deviceId: event.deviceId,
      type: event.type,
      value: event.textValue ?? event.value ?? '',
      timestamp: event.timestamp,
      ruleTriggered: notification?.ruleTriggered ?? null,
      severity: notification?.severity ?? null,
      message: notification?.message ?? null,
      status: notification?.status ?? null,
      sentAt: notification?.sentAt ?? null,
      failureReason: notification?.failureReason ?? null,
    };
  });

  // Client-side filter by severity/status (exclude non-notification rows when filtering)
  if (params?.severity) {
    rows = rows.filter(
      (row) => row.severity === params.severity,
    );
  }
  if (params?.status) {
    rows = rows.filter(
      (row) => row.status === params.status,
    );
  }

  const total = eventsData?.total ?? 0;
  const isLoading = eventsLoading || notificationsLoading;
  const isError = eventsIsError || notificationsIsError;
  const error = eventsError || notificationsError;

  return { rows, total, isLoading, isError, error };
}