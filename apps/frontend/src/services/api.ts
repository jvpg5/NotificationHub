import type {
  CreateEventDto,
  EventResponse,
  NotificationResponse,
  FarmResponse,
  DeviceResponse,
  PaginatedResponse,
} from 'shared-types';
import {
  EventType,
  NotificationStatus,
  Severity,
} from 'shared-types';

export class ApiError extends Error {
  status: number;
  fieldMessages: string[] | null;

  constructor(
    status: number,
    message: string,
    fieldMessages: string[] | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldMessages = fieldMessages;
  }
}

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = options ? await fetch(url, options) : await fetch(url);

  if (response.ok) {
    return response.json() as T;
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(response.status, response.statusText);
  }

  if (
    response.status === 400 &&
    body !== null &&
    typeof body === 'object' &&
    'message' in body &&
    Array.isArray((body as Record<string, unknown>).message)
  ) {
    throw new ApiError(
      400,
      'Validation error',
      (body as Record<string, unknown>).message as string[],
    );
  }

  if (
    body !== null &&
    typeof body === 'object' &&
    'message' in body &&
    typeof (body as Record<string, unknown>).message === 'string'
  ) {
    throw new ApiError(
      response.status,
      (body as Record<string, unknown>).message as string,
    );
  }

  throw new ApiError(response.status, response.statusText);
}

export function createEvent(dto: CreateEventDto): Promise<EventResponse> {
  return request<EventResponse>('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export function listEvents(
  params?: { limit?: number; offset?: number; type?: EventType },
): Promise<PaginatedResponse<EventResponse>> {
  const parts: string[] = [];
  if (params?.limit !== undefined) {
    parts.push(`limit=${encodeURIComponent(params.limit)}`);
  }
  if (params?.offset !== undefined) {
    parts.push(`offset=${encodeURIComponent(params.offset)}`);
  }
  if (params?.type !== undefined) {
    parts.push(`type=${encodeURIComponent(params.type)}`);
  }
  const qs = parts.length > 0 ? `?${parts.join('&')}` : '';
  return request<PaginatedResponse<EventResponse>>(`/api/events${qs}`);
}

export function getEvent(id: string): Promise<EventResponse> {
  return request<EventResponse>(
    `/api/events/${encodeURIComponent(id)}`,
  );
}

export function listNotifications(
  params?: {
    limit?: number;
    offset?: number;
    status?: NotificationStatus;
    severity?: Severity;
  },
): Promise<PaginatedResponse<NotificationResponse>> {
  const parts: string[] = [];
  if (params?.limit !== undefined) {
    parts.push(`limit=${encodeURIComponent(params.limit)}`);
  }
  if (params?.offset !== undefined) {
    parts.push(`offset=${encodeURIComponent(params.offset)}`);
  }
  if (params?.status !== undefined) {
    parts.push(`status=${encodeURIComponent(params.status)}`);
  }
  if (params?.severity !== undefined) {
    parts.push(`severity=${encodeURIComponent(params.severity)}`);
  }
  const qs = parts.length > 0 ? `?${parts.join('&')}` : '';
  return request<PaginatedResponse<NotificationResponse>>(
    `/api/notifications${qs}`,
  );
}

export function getNotification(
  id: string,
): Promise<NotificationResponse> {
  return request<NotificationResponse>(
    `/api/notifications/${encodeURIComponent(id)}`,
  );
}

export function getFarm(): Promise<FarmResponse> {
  return request<FarmResponse>('/api/farm');
}

export function listDevices(): Promise<{ data: DeviceResponse[] }> {
  return request<{ data: DeviceResponse[] }>('/api/devices');
}