import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import History from './History';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Mock data (canonical scenarios from scenarios.md S1–S7)
// ---------------------------------------------------------------------------

const mockEvents = [
  {
    id: 'event-001',
    farmId: 'farm-001',
    deviceId: 'sensor-temp-01',
    type: 'AIR_TEMPERATURE',
    value: 38.5,
    textValue: null,
    unit: 'C',
    timestamp: '2026-08-17T14:30:00.000-03:00',
    receivedAt: '2026-08-17T14:30:01.000-03:00',
  },
  {
    id: 'event-002',
    farmId: 'farm-001',
    deviceId: 'sensor-hum-01',
    type: 'AIR_HUMIDITY',
    value: 24,
    textValue: null,
    unit: '%',
    timestamp: '2026-08-17T15:00:00.000-03:00',
    receivedAt: '2026-08-17T15:00:01.000-03:00',
  },
  {
    id: 'event-003',
    farmId: 'farm-001',
    deviceId: 'sensor-soil-01',
    type: 'SOIL_MOISTURE',
    value: 17,
    textValue: null,
    unit: '%',
    timestamp: '2026-08-17T15:30:00.000-03:00',
    receivedAt: '2026-08-17T15:30:01.000-03:00',
  },
  {
    id: 'event-004',
    farmId: 'farm-001',
    deviceId: 'sensor-water-01',
    type: 'WATER_RESERVOIR_LEVEL',
    value: 12,
    textValue: null,
    unit: '%',
    timestamp: '2026-08-17T16:00:00.000-03:00',
    receivedAt: '2026-08-17T16:00:01.000-03:00',
  },
  {
    id: 'event-005',
    farmId: 'farm-001',
    deviceId: 'silo-sensor-01',
    type: 'SILO_LEVEL',
    value: 10,
    textValue: null,
    unit: '%',
    timestamp: '2026-08-17T16:30:00.000-03:00',
    receivedAt: '2026-08-17T16:30:01.000-03:00',
  },
  {
    id: 'event-006',
    farmId: 'farm-001',
    deviceId: 'irrigation-pump-01',
    type: 'EQUIPMENT_STATUS',
    value: null,
    textValue: 'FAILURE',
    unit: null,
    timestamp: '2026-08-17T17:00:00.000-03:00',
    receivedAt: '2026-08-17T17:00:01.000-03:00',
  },
  {
    id: 'event-007',
    farmId: 'farm-001',
    deviceId: 'sensor-temp-01',
    type: 'AIR_TEMPERATURE',
    value: 27.0,
    textValue: null,
    unit: 'C',
    timestamp: '2026-08-17T18:00:00.000-03:00',
    receivedAt: '2026-08-17T18:00:01.000-03:00',
  },
];

const mockNotifications = [
  {
    id: 'notif-001',
    eventId: 'event-001',
    farmId: 'farm-001',
    deviceId: 'sensor-temp-01',
    eventType: 'AIR_TEMPERATURE',
    eventValue: 38.5,
    ruleTriggered: 'AIR_TEMPERATURE_HIGH',
    severity: 'WARNING',
    message:
      '\u26a0\ufe0f Temperature alert: 38.5\u00b0C recorded by sensor sensor-temp-01 at Fazenda Boa Esperan\u00e7a.',
    status: 'SENT',
    sentAt: '2026-08-17T14:30:02.000-03:00',
    failureReason: null,
    createdAt: '2026-08-17T14:30:01.000-03:00',
    updatedAt: '2026-08-17T14:30:02.000-03:00',
  },
  {
    id: 'notif-002',
    eventId: 'event-002',
    farmId: 'farm-001',
    deviceId: 'sensor-hum-01',
    eventType: 'AIR_HUMIDITY',
    eventValue: 24,
    ruleTriggered: 'AIR_HUMIDITY_LOW',
    severity: 'INFO',
    message:
      '\u26a0\ufe0f Low humidity alert: air humidity reached 24% at Fazenda Boa Esperan\u00e7a.',
    status: 'SENT',
    sentAt: '2026-08-17T15:00:02.000-03:00',
    failureReason: null,
    createdAt: '2026-08-17T15:00:01.000-03:00',
    updatedAt: '2026-08-17T15:00:02.000-03:00',
  },
  {
    id: 'notif-003',
    eventId: 'event-003',
    farmId: 'farm-001',
    deviceId: 'sensor-soil-01',
    eventType: 'SOIL_MOISTURE',
    eventValue: 17,
    ruleTriggered: 'SOIL_MOISTURE_LOW',
    severity: 'INFO',
    message:
      '💧 Irrigation alert: soil moisture is at 17%. Check irrigation needs.',
    status: 'SENT',
    sentAt: '2026-08-17T15:30:02.000-03:00',
    failureReason: null,
    createdAt: '2026-08-17T15:30:01.000-03:00',
    updatedAt: '2026-08-17T15:30:02.000-03:00',
  },
  {
    id: 'notif-004',
    eventId: 'event-004',
    farmId: 'farm-001',
    deviceId: 'sensor-water-01',
    eventType: 'WATER_RESERVOIR_LEVEL',
    eventValue: 12,
    ruleTriggered: 'WATER_RESERVOIR_LOW',
    severity: 'WARNING',
    message:
      '💧 Low water level: the reservoir is at only 12% of capacity.',
    status: 'SENT',
    sentAt: '2026-08-17T16:00:02.000-03:00',
    failureReason: null,
    createdAt: '2026-08-17T16:00:01.000-03:00',
    updatedAt: '2026-08-17T16:00:02.000-03:00',
  },
  {
    id: 'notif-005',
    eventId: 'event-005',
    farmId: 'farm-001',
    deviceId: 'silo-sensor-01',
    eventType: 'SILO_LEVEL',
    eventValue: 10,
    ruleTriggered: 'SILO_LEVEL_LOW',
    severity: 'WARNING',
    message:
      '\u26a0\ufe0f Low silo level: the silo monitored by silo-sensor-01 is at 10% of capacity.',
    status: 'SENT',
    sentAt: '2026-08-17T16:30:02.000-03:00',
    failureReason: null,
    createdAt: '2026-08-17T16:30:01.000-03:00',
    updatedAt: '2026-08-17T16:30:02.000-03:00',
  },
  {
    id: 'notif-006',
    eventId: 'event-006',
    farmId: 'farm-001',
    deviceId: 'irrigation-pump-01',
    eventType: 'EQUIPMENT_STATUS',
    eventValue: 'FAILURE',
    ruleTriggered: 'EQUIPMENT_FAILURE',
    severity: 'CRITICAL',
    message:
      '🚨 Equipment failure: a failure was detected on equipment irrigation-pump-01.',
    status: 'SENT',
    sentAt: '2026-08-17T17:00:02.000-03:00',
    failureReason: null,
    createdAt: '2026-08-17T17:00:01.000-03:00',
    updatedAt: '2026-08-17T17:00:02.000-03:00',
  },
];

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockListEvents = vi.fn();
const mockListNotifications = vi.fn();

vi.mock('../services/api', () => ({
  listEvents: (...args: unknown[]) => mockListEvents(...args),
  listNotifications: (...args: unknown[]) => mockListNotifications(...args),
}));

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests: Normal (all SENT) scenarios
// ---------------------------------------------------------------------------

describe('History page — normal scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListEvents.mockImplementation((params?: { type?: string }) => {
      const type = params?.type;
      const data = type
        ? mockEvents.filter((e) => e.type === type)
        : mockEvents;
      return Promise.resolve({ data, total: data.length });
    });
    mockListNotifications.mockResolvedValue({
      data: mockNotifications,
      total: 6,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders heading and filter controls', async () => {
    render(<History />, { wrapper });

    expect(screen.getByText('History')).toBeInTheDocument();

    // Three filter selects should be present
    expect(screen.getByLabelText('Event Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Severity')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    // Never resolve — keeps queries loading
    mockListEvents.mockReturnValue(new Promise(() => {}));
    mockListNotifications.mockReturnValue(new Promise(() => {}));

    render(<History />, { wrapper });

    // SkeletonCard should be visible (has animate-pulse class)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows error state', async () => {
    mockListEvents.mockRejectedValue(new Error('Network error'));

    render(<History />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load data/i),
      ).toBeInTheDocument();
    });
  });

  it('shows all 7 events with notification chain (AC-1)', async () => {
    render(<History />, { wrapper });

    // Wait for the table to render (rows appear)
    await waitFor(() => {
      expect(screen.getByText('event-001')).toBeInTheDocument();
    });

    // 7 event rows should be visible
    expect(screen.getByText('event-001')).toBeInTheDocument();
    expect(screen.getByText('event-002')).toBeInTheDocument();
    expect(screen.getByText('event-003')).toBeInTheDocument();
    expect(screen.getByText('event-004')).toBeInTheDocument();
    expect(screen.getByText('event-005')).toBeInTheDocument();
    expect(screen.getByText('event-006')).toBeInTheDocument();
    expect(screen.getByText('event-007')).toBeInTheDocument();

    // 6 rows show notification data (rule names)
    expect(screen.getByText('AIR_TEMPERATURE_HIGH')).toBeInTheDocument();
    expect(screen.getByText('AIR_HUMIDITY_LOW')).toBeInTheDocument();
    expect(screen.getByText('SOIL_MOISTURE_LOW')).toBeInTheDocument();
    expect(screen.getByText('WATER_RESERVOIR_LOW')).toBeInTheDocument();
    expect(screen.getByText('SILO_LEVEL_LOW')).toBeInTheDocument();
    expect(screen.getByText('EQUIPMENT_FAILURE')).toBeInTheDocument();

    // event-007 has no notification → "No alert"
    // Find the row for event-007 and check for "No alert"
    const noAlertElements = screen.getAllByText('No alert');
    expect(noAlertElements.length).toBe(1);
  });

  it('filters by severity CRITICAL (AC-2)', async () => {
    render(<History />, { wrapper });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('event-001')).toBeInTheDocument();
    });

    // Change severity filter to CRITICAL
    const severitySelect = screen.getByLabelText('Severity');
    fireEvent.change(severitySelect, { target: { value: 'CRITICAL' } });

    // Should re-render with only the equipment failure row
    // event-006 (EQUIPMENT_STATUS, CRITICAL) should be visible
    // event-001 (AIR_TEMPERATURE, WARNING) should not be visible
    await waitFor(() => {
      expect(screen.queryByText('event-001')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('event-002')).not.toBeInTheDocument();
    expect(screen.queryByText('event-003')).not.toBeInTheDocument();
    expect(screen.queryByText('event-004')).not.toBeInTheDocument();
    expect(screen.queryByText('event-005')).not.toBeInTheDocument();
    expect(screen.getByText('event-006')).toBeInTheDocument();
    expect(screen.queryByText('event-007')).not.toBeInTheDocument();

    // The CRITICAL badge should be visible (in both the select option and table badge)
    const criticalElements = screen.getAllByText('CRITICAL');
    expect(criticalElements.length).toBeGreaterThanOrEqual(2);
  });

  it('filters by event type', async () => {
    render(<History />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('event-001')).toBeInTheDocument();
    });

    // Filter by AIR_TEMPERATURE
    const typeSelect = screen.getByLabelText('Event Type');
    fireEvent.change(typeSelect, { target: { value: 'AIR_TEMPERATURE' } });

    // Only events 001 and 007 (both AIR_TEMPERATURE) should be visible
    await waitFor(() => {
      expect(screen.getByText('event-001')).toBeInTheDocument();
    });

    expect(screen.getByText('event-007')).toBeInTheDocument();
    // event-002 (AIR_HUMIDITY) should not be visible
    expect(screen.queryByText('event-002')).not.toBeInTheDocument();
  });

  it('filters reset page to 1', async () => {
    // We need to check that after changing a filter, the page resets.
    // Since there are only 7 events and PAGE_SIZE=20, there's only 1 page.
    // We can verify that the page indicator shows Page 1.
    render(<History />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('event-001')).toBeInTheDocument();
    });

    // Page info should show page 1
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();

    // Change filter — page should still be 1
    const severitySelect = screen.getByLabelText('Severity');
    fireEvent.change(severitySelect, { target: { value: 'WARNING' } });

    await waitFor(() => {
      // After filtering, the page should still be 1
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });
  });

  it('pagination controls render', async () => {
    render(<History />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('event-001')).toBeInTheDocument();
    });

    // Previous and Next buttons should be present
    const prevButton = screen.getByText('Previous');
    const nextButton = screen.getByText('Next');
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    // Previous should be disabled (we're on page 1)
    expect(prevButton).toBeDisabled();

    // Page info should be visible
    expect(screen.getByText(/Page \d+ of \d+/)).toBeInTheDocument();
  });

  it('converts value types correctly (equipment vs numeric)', async () => {
    render(<History />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('event-001')).toBeInTheDocument();
    });

    // Find event-006 row (equipment status)
    const table = document.querySelector('table')!;
    const rows = within(table).getAllByRole('row');

    // After header, find the equipment row (event-006)
    const eqRow = rows.find((row) => row.textContent?.includes('event-006'));
    expect(eqRow).toBeDefined();
    // Equipment value should be "FAILURE" (not number like "FAILURE.0")
    expect(eqRow!.textContent).toContain('FAILURE');

    // Find a sensor row (event-001 = 38.5)
    const sensorRow = rows.find((row) => row.textContent?.includes('event-001'));
    expect(sensorRow).toBeDefined();
    // Sensor value should be formatted with 1 decimal
    expect(sensorRow!.textContent).toContain('38.5');
  });
});

// ---------------------------------------------------------------------------
// Tests: FAILED notification scenario (AC-3)
// ---------------------------------------------------------------------------

describe('History page — FAILED notification (AC-3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListEvents.mockResolvedValue({ data: mockEvents, total: 7 });

    // Variant: notif-006 is FAILED with a reason
    const failedNotifications = mockNotifications.map((n) =>
      n.id === 'notif-006'
        ? {
            ...n,
            status: 'FAILED',
            failureReason: 'WhatsApp API timeout',
            sentAt: null,
          }
        : n,
    );
    mockListNotifications.mockResolvedValue({
      data: failedNotifications,
      total: 6,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('shows FAILED status with reason (AC-3)', async () => {
    render(<History />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('event-006')).toBeInTheDocument();
    });

    // Should show FAILED status badge
    const failedBadges = screen.getAllByText('FAILED');
    expect(failedBadges.length).toBeGreaterThanOrEqual(1);

    // Should show the failure reason (appears in both Failure Reason and Outcome columns)
    const reasonElements = screen.getAllByText(/WhatsApp API timeout/);
    expect(reasonElements.length).toBeGreaterThanOrEqual(1);
  });
});