import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './Dashboard';
import type { ReactNode } from 'react';

const getFarmMock = vi.fn();
const listDevicesMock = vi.fn();
const listEventsMock = vi.fn();
const listNotificationsMock = vi.fn();

vi.mock('../services/api', () => ({
  getFarm: (...args: unknown[]) => getFarmMock(...args),
  listDevices: (...args: unknown[]) => listDevicesMock(...args),
  listEvents: (...args: unknown[]) => listEventsMock(...args),
  listNotifications: (...args: unknown[]) => listNotificationsMock(...args),
}));

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

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all four sections with mock data', async () => {
    getFarmMock.mockResolvedValue({
      id: 'farm-1',
      name: 'Fazenda Boa Esperança',
      producer: 'João Silva',
      phone: '+5535999999999',
    });

    listDevicesMock.mockResolvedValue({
      data: [
        { id: 'd1', farmId: 'farm-1', type: 'AIR_TEMPERATURE', label: 'Temp Sensor' },
      ],
    });

    listEventsMock.mockResolvedValue({
      data: [
        {
          id: 'evt-1',
          farmId: 'farm-1',
          deviceId: 'd1',
          type: 'AIR_TEMPERATURE',
          value: 25.4,
          textValue: null,
          unit: '°C',
          timestamp: '2026-08-30T10:00:00.000Z',
          receivedAt: '2026-08-30T10:00:01.000Z',
        },
      ],
      total: 1,
    });

    listNotificationsMock.mockResolvedValue({
      data: [
        {
          id: 'notif-1',
          eventId: 'evt-1',
          farmId: 'farm-1',
          deviceId: 'd1',
          eventType: 'AIR_TEMPERATURE',
          eventValue: 42,
          ruleTriggered: 'AIR_TEMPERATURE_HIGH',
          severity: 'WARNING',
          message: 'Air temperature is high: 42°C',
          status: 'PENDING',
          sentAt: null,
          failureReason: null,
          createdAt: '2026-08-30T10:05:00.000Z',
          updatedAt: '2026-08-30T10:05:00.000Z',
        },
      ],
      total: 1,
    });

    render(<Dashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Fazenda Boa Esperança')).toBeInTheDocument();
    });

    // All four sections visible
    expect(screen.getByText('Farm Overview')).toBeInTheDocument();
    expect(screen.getByText('Fazenda Boa Esperança')).toBeInTheDocument();
    expect(screen.getByText('Temp Sensor')).toBeInTheDocument();
    expect(screen.getByText('Latest Events')).toBeInTheDocument();
    expect(screen.getByText('Latest Notifications')).toBeInTheDocument();
    expect(screen.getByText('Air temperature is high: 42°C')).toBeInTheDocument();
  });

  it('shows loading states initially', () => {
    // Never resolve — keeps all queries loading
    getFarmMock.mockReturnValue(new Promise(() => {}));
    listDevicesMock.mockReturnValue(new Promise(() => {}));
    listEventsMock.mockReturnValue(new Promise(() => {}));
    listNotificationsMock.mockReturnValue(new Promise(() => {}));

    render(<Dashboard />, { wrapper });

    // Should show skeleton loading states
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(2); // at least FarmInfo + Events/Notifications
  });
});