import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SimulatorForm from './SimulatorForm';
import { ApiError } from '../services/api';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const createEventMock = vi.fn();
const listDevicesMock = vi.fn();
const listNotificationsMock = vi.fn();

vi.mock('../services/api', async () => {
  const actual =
    await vi.importActual<typeof import('../services/api')>(
      '../services/api',
    );
  return {
    ...actual,
    createEvent: (...args: unknown[]) => createEventMock(...args),
    listDevices: (...args: unknown[]) => listDevicesMock(...args),
    listNotifications: (...args: unknown[]) => listNotificationsMock(...args),
  };
});

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
// Fixtures
// ---------------------------------------------------------------------------

const mockDevices = [
  {
    id: 'sensor-temp-01',
    farmId: 'farm-001',
    type: 'AIR_TEMPERATURE' as const,
    label: 'Temp Sensor',
  },
  {
    id: 'sensor-humidity-01',
    farmId: 'farm-001',
    type: 'AIR_HUMIDITY' as const,
    label: 'Humidity Sensor',
  },
  {
    id: 'irrigation-pump-01',
    farmId: 'farm-001',
    type: 'EQUIPMENT_STATUS' as const,
    label: 'Irrigation Pump',
  },
];

/**
 * Helper: select a device by value and wait for the derived type/unit to appear.
 */
async function selectDevice(deviceId: string) {
  const deviceSelect = screen.getByLabelText('Device') as HTMLSelectElement;
  fireEvent.change(deviceSelect, { target: { value: deviceId } });

  // Wait for React to process the state update
  await waitFor(() => {
    expect(
      (screen.getByLabelText('Device') as HTMLSelectElement).value,
    ).toBe(deviceId);
  });
}

/** Wait for devices to finish loading (options > 1 means data arrived). */
async function waitForDevices() {
  await waitFor(() => {
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(1); // placeholder + devices
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SimulatorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listDevicesMock.mockResolvedValue({ data: mockDevices });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  // 1. Renders form with devices loaded
  it('renders form with device options after loading', async () => {
    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    const options = screen.getAllByRole('option');
    const labels = options.map((o) => (o as HTMLOptionElement).textContent);
    expect(labels.some((l) => l?.includes('Temp Sensor'))).toBe(true);
    expect(labels.some((l) => l?.includes('Irrigation Pump'))).toBe(true);
    expect(screen.getByText('Submit Event')).toBeInTheDocument();
  });

  // 2. Shows numeric input for sensor, select for equipment
  it('shows number input for sensor and select for equipment device', async () => {
    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    // Select sensor device
    await selectDevice('sensor-temp-01');
    expect((document.getElementById('value-input') as HTMLInputElement).type).toBe('number');

    // Select equipment device
    await selectDevice('irrigation-pump-01');
    expect((document.getElementById('value-input') as HTMLElement).tagName).toBe('SELECT');
  });

  // 3. Preset fills form without submitting
  it('preset fills form but does not submit', async () => {
    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    // Click the first preset
    const presetBtn = screen.getByText('Temperature 38.5°C (alert)');
    fireEvent.click(presetBtn);

    // Wait for form to update
    await waitFor(() => {
      const deviceSelect = screen.getByLabelText('Device') as HTMLSelectElement;
      expect(deviceSelect.value).toBe('sensor-temp-01');
    });

    const valueInput = document.getElementById('value-input') as HTMLInputElement;
    expect(valueInput.value).toBe('38.5');

    // createEvent should NOT have been called
    expect(createEventMock).not.toHaveBeenCalled();
  });

  // 4. Show derived type/unit when device selected
  it('shows derived type and unit when a device is selected', async () => {
    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    // Select temperature sensor
    await selectDevice('sensor-temp-01');
    await waitFor(() => {
      expect(screen.getByText(/Type:.*AIR_TEMPERATURE/)).toBeInTheDocument();
      expect(screen.getByText(/Unit:.*C/)).toBeInTheDocument();
    });

    // Select equipment
    await selectDevice('irrigation-pump-01');
    await waitFor(() => {
      expect(screen.getByText(/Type:.*EQUIPMENT_STATUS/)).toBeInTheDocument();
      expect(screen.getByText(/Unit:.*none/)).toBeInTheDocument();
    });
  });

  // 5. Client-side validation — missing eventId
  it('shows error for empty eventId and does not call API', async () => {
    createEventMock.mockResolvedValue({ id: 'evt-1' });

    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    // Select a device first
    await selectDevice('sensor-temp-01');

    // Set value
    const valueInput = document.getElementById('value-input') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '25' } });

    // Clear eventId
    const eventIdInput = screen.getByLabelText('Event ID') as HTMLInputElement;
    fireEvent.change(eventIdInput, { target: { value: '' } });

    // Submit
    fireEvent.click(screen.getByText('Submit Event'));

    // Wait for validation error
    await waitFor(() => {
      expect(screen.getByText('Event ID is required.')).toBeInTheDocument();
    });

    // createEvent should NOT have been called
    expect(createEventMock).not.toHaveBeenCalled();
  });

  // 6. Client-side validation — out-of-range value
  it('shows error for out-of-range value and does not call API', async () => {
    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    // Select temperature sensor
    await selectDevice('sensor-temp-01');

    // Set out-of-range value
    const valueInput = document.getElementById('value-input') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '999' } });

    // Submit
    fireEvent.click(screen.getByText('Submit Event'));

    await waitFor(() => {
      expect(
        screen.getByText(/Value must be between -20 and 60/),
      ).toBeInTheDocument();
    });

    expect(createEventMock).not.toHaveBeenCalled();
  });

  // 7. Submit — success (alert generated)
  it('shows alert feedback when a notification is found after submit', async () => {
    createEventMock.mockResolvedValue({
      id: 'evt-1',
      farmId: 'farm-001',
      deviceId: 'sensor-temp-01',
      type: 'AIR_TEMPERATURE',
      value: 38.5,
      textValue: null,
      unit: 'C',
      timestamp: '2026-08-30T10:00:00.000Z',
      receivedAt: '2026-08-30T10:00:01.000Z',
    });

    listNotificationsMock.mockResolvedValue({
      data: [
        {
          id: 'notif-1',
          eventId: 'my-event-id',
          farmId: 'farm-001',
          deviceId: 'sensor-temp-01',
          eventType: 'AIR_TEMPERATURE',
          eventValue: 38.5,
          ruleTriggered: 'AIR_TEMPERATURE_HIGH',
          severity: 'WARNING',
          message: 'Air temperature is high: 38.5°C',
          status: 'PENDING',
          sentAt: null,
          failureReason: null,
          createdAt: '2026-08-30T10:05:00.000Z',
          updatedAt: '2026-08-30T10:05:00.000Z',
        },
      ],
      total: 1,
    });

    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    // Select device
    await selectDevice('sensor-temp-01');

    // Set eventId
    const eventIdInput = screen.getByLabelText('Event ID') as HTMLInputElement;
    fireEvent.change(eventIdInput, { target: { value: 'my-event-id' } });

    // Set value
    const valueInput = document.getElementById('value-input') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '38.5' } });

    // Submit
    fireEvent.click(screen.getByText('Submit Event'));

    // Wait for feedback
    await waitFor(
      () => {
        expect(
          screen.getByText('Air temperature is high: 38.5°C'),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  // 8. Submit — success (no alert)
  it('shows no-alert feedback when no notification is found', async () => {
    createEventMock.mockResolvedValue({
      id: 'evt-1',
      farmId: 'farm-001',
      deviceId: 'sensor-temp-01',
      type: 'AIR_TEMPERATURE',
      value: 27,
      textValue: null,
      unit: 'C',
      timestamp: '2026-08-30T10:00:00.000Z',
      receivedAt: '2026-08-30T10:00:01.000Z',
    });

    listNotificationsMock.mockResolvedValue({ data: [], total: 0 });

    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    await selectDevice('sensor-temp-01');

    const valueInput = document.getElementById('value-input') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '27' } });

    fireEvent.click(screen.getByText('Submit Event'));

    await waitFor(
      () => {
        expect(
          screen.getByText('Event recorded — no alert generated.'),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  // 9. Submit — duplicate (response flag)
  it('shows duplicate feedback when response has duplicate flag', async () => {
    createEventMock.mockResolvedValue({
      id: 'evt-1',
      farmId: 'farm-001',
      deviceId: 'sensor-temp-01',
      type: 'AIR_TEMPERATURE',
      value: 38.5,
      textValue: null,
      unit: 'C',
      timestamp: '2026-08-30T10:00:00.000Z',
      receivedAt: '2026-08-30T10:00:01.000Z',
      duplicate: true,
    });

    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    await selectDevice('sensor-temp-01');

    const valueInput = document.getElementById('value-input') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '38.5' } });

    fireEvent.click(screen.getByText('Submit Event'));

    await waitFor(() => {
      expect(
        screen.getByText('Duplicate event — already processed.'),
      ).toBeInTheDocument();
    });
  });

  // 10. Submit — invalid (server error with field messages)
  it('shows server validation errors on 400 response', async () => {
    createEventMock.mockRejectedValue(
      new ApiError(400, 'Validation error', [
        'value must be a number',
        'deviceId is required',
      ]),
    );

    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    await selectDevice('sensor-temp-01');

    const valueInput = document.getElementById('value-input') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '25' } });

    fireEvent.click(screen.getByText('Submit Event'));

    await waitFor(() => {
      expect(screen.getByText('value must be a number')).toBeInTheDocument();
      expect(screen.getByText('deviceId is required')).toBeInTheDocument();
    });
  });

  // 11. Submit button disabled while pending
  it('disables submit button while mutation is pending', async () => {
    // Never resolves
    createEventMock.mockReturnValue(new Promise(() => {}));

    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    await selectDevice('sensor-temp-01');

    const valueInput = document.getElementById('value-input') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '25' } });

    fireEvent.click(screen.getByText('Submit Event'));

    // Button should show submitting text and be disabled
    await waitFor(() => {
      expect(screen.getByText('Submitting…')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /Submitting/ });
    expect(button).toBeDisabled();
  });

  // 12. Form stays usable after submit
  it('keeps value after successful submit', async () => {
    createEventMock.mockResolvedValue({
      id: 'evt-1',
      farmId: 'farm-001',
      deviceId: 'sensor-temp-01',
      type: 'AIR_TEMPERATURE',
      value: 27,
      textValue: null,
      unit: 'C',
      timestamp: '2026-08-30T10:00:00.000Z',
      receivedAt: '2026-08-30T10:00:01.000Z',
    });

    listNotificationsMock.mockResolvedValue({ data: [], total: 0 });

    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    await selectDevice('sensor-temp-01');

    const valueInput = document.getElementById('value-input') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '27' } });

    fireEvent.click(screen.getByText('Submit Event'));

    await waitFor(
      () => {
        expect(
          screen.getByText('Event recorded — no alert generated.'),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Value input should still have the value
    const valueAfter = document.getElementById('value-input') as HTMLInputElement;
    expect(valueAfter).not.toBeNull();
    expect(valueAfter.value).toBe('27');

    // Device selector should still be set
    expect((screen.getByLabelText('Device') as HTMLSelectElement).value).toBe('sensor-temp-01');

    // Event ID should have changed
    const eventIdAfter = (screen.getByLabelText('Event ID') as HTMLInputElement).value;
    expect(eventIdAfter).toBeTruthy();
  });

  // 13. eventId auto-generated on mount
  it('auto-generates eventId on mount', async () => {
    render(<SimulatorForm />, { wrapper });

    await waitForDevices();

    const eventIdInput = screen.getByLabelText('Event ID') as HTMLInputElement;
    expect(eventIdInput.value).toBeTruthy();
    expect(eventIdInput.value).toMatch(/^event-/);
  });
});