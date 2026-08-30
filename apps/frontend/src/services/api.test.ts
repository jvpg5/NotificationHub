import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createEvent,
  listEvents,
  getEvent,
  listNotifications,
  getNotification,
  getFarm,
  listDevices,
  ApiError,
} from './api';
import { EventType, NotificationStatus, Severity } from 'shared-types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockResponse<T>(status: number, body: T) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// createEvent
// ---------------------------------------------------------------------------

describe('createEvent', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const dto = {
    eventId: 'evt-1',
    farmId: 'farm-1',
    deviceId: 'sensor-1',
    type: EventType.AIR_TEMPERATURE,
    value: 38.5,
    unit: 'C',
    timestamp: '2026-08-30T12:00:00-03:00',
  };

  const eventResponse = {
    id: 'evt-1',
    farmId: 'farm-1',
    deviceId: 'sensor-1',
    type: EventType.AIR_TEMPERATURE,
    value: 38.5,
    textValue: null,
    unit: 'C',
    timestamp: '2026-08-30T12:00:00.000-03:00',
    receivedAt: '2026-08-30T12:00:01.000-03:00',
  };

  it('returns EventResponse on 201', async () => {
    mockFetch.mockResolvedValue(mockResponse(201, eventResponse));

    const result = await createEvent(dto);

    expect(result).toEqual(eventResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
  });

  it('throws ApiError with fieldMessages on 400', async () => {
    mockFetch.mockResolvedValue(
      mockResponse(400, {
        message: ['value must be a number', 'unit must be one of: %'],
      }),
    );

    await expect(createEvent(dto)).rejects.toThrow(ApiError);
    await expect(createEvent(dto)).rejects.toMatchObject({
      status: 400,
      message: 'Validation error',
      fieldMessages: ['value must be a number', 'unit must be one of: %'],
    });
  });
});

// ---------------------------------------------------------------------------
// listEvents
// ---------------------------------------------------------------------------

describe('listEvents', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const paginatedResponse = {
    data: [
      {
        id: 'evt-1',
        farmId: 'farm-1',
        deviceId: 'sensor-1',
        type: EventType.AIR_TEMPERATURE,
        value: 38.5,
        textValue: null,
        unit: 'C',
        timestamp: '2026-08-30T12:00:00.000-03:00',
        receivedAt: '2026-08-30T12:00:01.000-03:00',
      },
    ],
    total: 1,
  };

  it('returns PaginatedResponse on success', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, paginatedResponse));

    const result = await listEvents();

    expect(result).toEqual(paginatedResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/events');
  });

  it('builds query string with all params', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, paginatedResponse));

    await listEvents({
      limit: 10,
      offset: 20,
      type: EventType.AIR_TEMPERATURE,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/events?limit=10&offset=20&type=AIR_TEMPERATURE',
    );
  });

  it('does not append query string when params are empty', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, paginatedResponse));

    await listEvents({});

    expect(mockFetch).toHaveBeenCalledWith('/api/events');
  });
});

// ---------------------------------------------------------------------------
// getEvent
// ---------------------------------------------------------------------------

describe('getEvent', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const eventResponse = {
    id: 'evt-1',
    farmId: 'farm-1',
    deviceId: 'sensor-1',
    type: EventType.AIR_TEMPERATURE,
    value: 38.5,
    textValue: null,
    unit: 'C',
    timestamp: '2026-08-30T12:00:00.000-03:00',
    receivedAt: '2026-08-30T12:00:01.000-03:00',
  };

  it('returns EventResponse on 200', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, eventResponse));

    const result = await getEvent('evt-1');

    expect(result).toEqual(eventResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/events/evt-1');
  });

  it('throws ApiError on 404', async () => {
    mockFetch.mockResolvedValue(
      mockResponse(404, { message: 'Event not found' }),
    );

    await expect(getEvent('evt-999')).rejects.toThrow(ApiError);
    await expect(getEvent('evt-999')).rejects.toMatchObject({
      status: 404,
      message: 'Event not found',
    });
  });

  it('encodes special characters in id', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, eventResponse));

    await getEvent('evt/with&special');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/events/evt%2Fwith%26special',
    );
  });
});

// ---------------------------------------------------------------------------
// listNotifications
// ---------------------------------------------------------------------------

describe('listNotifications', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const paginatedResponse = {
    data: [
      {
        id: 'notif-1',
        eventId: 'evt-1',
        farmId: 'farm-1',
        deviceId: 'sensor-1',
        eventType: EventType.AIR_TEMPERATURE,
        eventValue: 38.5,
        ruleTriggered: 'AIR_TEMPERATURE_HIGH',
        severity: Severity.WARNING,
        message: 'Temperature alert',
        status: NotificationStatus.SENT,
        sentAt: '2026-08-30T12:00:01.000-03:00',
        failureReason: null,
        createdAt: '2026-08-30T12:00:00.000-03:00',
        updatedAt: '2026-08-30T12:00:01.000-03:00',
      },
    ],
    total: 1,
  };

  it('returns PaginatedResponse on success', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, paginatedResponse));

    const result = await listNotifications();

    expect(result).toEqual(paginatedResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications');
  });

  it('builds query string with all params', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, paginatedResponse));

    await listNotifications({
      limit: 10,
      offset: 5,
      status: NotificationStatus.PENDING,
      severity: Severity.CRITICAL,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/notifications?limit=10&offset=5&status=PENDING&severity=CRITICAL',
    );
  });
});

// ---------------------------------------------------------------------------
// getNotification
// ---------------------------------------------------------------------------

describe('getNotification', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const notificationResponse = {
    id: 'notif-1',
    eventId: 'evt-1',
    farmId: 'farm-1',
    deviceId: 'sensor-1',
    eventType: EventType.AIR_TEMPERATURE,
    eventValue: 38.5,
    ruleTriggered: 'AIR_TEMPERATURE_HIGH',
    severity: Severity.WARNING,
    message: 'Temperature alert',
    status: NotificationStatus.SENT,
    sentAt: '2026-08-30T12:00:01.000-03:00',
    failureReason: null,
    createdAt: '2026-08-30T12:00:00.000-03:00',
    updatedAt: '2026-08-30T12:00:01.000-03:00',
  };

  it('returns NotificationResponse on 200', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, notificationResponse));

    const result = await getNotification('notif-1');

    expect(result).toEqual(notificationResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/notif-1');
  });
});

// ---------------------------------------------------------------------------
// getFarm
// ---------------------------------------------------------------------------

describe('getFarm', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const farmResponse = {
    id: 'farm-1',
    name: 'Fazenda Boa Esperança',
    producer: 'João Silva',
    phone: '+5535999999999',
  };

  it('returns FarmResponse on 200', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, farmResponse));

    const result = await getFarm();

    expect(result).toEqual(farmResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/farm');
  });
});

// ---------------------------------------------------------------------------
// listDevices
// ---------------------------------------------------------------------------

describe('listDevices', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const devicesResponse = {
    data: [
      {
        id: 'sensor-1',
        farmId: 'farm-1',
        type: EventType.AIR_TEMPERATURE,
        label: 'Ambient temperature sensor',
      },
    ],
  };

  it('returns DeviceResponse array on 200', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, devicesResponse));

    const result = await listDevices();

    expect(result).toEqual(devicesResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/devices');
  });
});