import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DeviceList from './DeviceList';
import type { ReactNode } from 'react';

const listDevicesMock = vi.fn();

vi.mock('../services/api', () => ({
  listDevices: (...args: unknown[]) => listDevicesMock(...args),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const devicesResponse = {
  data: [
    { id: 'd1', farmId: 'farm-1', type: 'AIR_TEMPERATURE', label: 'Temperature Sensor A' },
    { id: 'd2', farmId: 'farm-1', type: 'AIR_HUMIDITY', label: 'Humidity Sensor' },
    { id: 'd3', farmId: 'farm-1', type: 'SOIL_MOISTURE', label: 'Soil Moisture Probe' },
  ],
};

describe('DeviceList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders device list on success', async () => {
    listDevicesMock.mockResolvedValue(devicesResponse);

    render(<DeviceList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Temperature Sensor A')).toBeInTheDocument();
    });

    expect(screen.getByText('Humidity Sensor')).toBeInTheDocument();
    expect(screen.getByText('Soil Moisture Probe')).toBeInTheDocument();
  });

  it('shows correct count of devices', async () => {
    listDevicesMock.mockResolvedValue(devicesResponse);

    render(<DeviceList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Temperature Sensor A')).toBeInTheDocument();
    });

    // All 3 type badges should be rendered
    const badges = screen.getAllByText(/^(AIR_TEMPERATURE|AIR_HUMIDITY|SOIL_MOISTURE)$/);
    expect(badges).toHaveLength(3);
  });

  it('shows skeleton while loading', () => {
    listDevicesMock.mockReturnValue(new Promise(() => {}));

    render(<DeviceList />, { wrapper });

    const skeletonContainer = document.querySelector('.animate-pulse');
    expect(skeletonContainer).toBeInTheDocument();
  });

  it('shows error message on failure', async () => {
    listDevicesMock.mockRejectedValue(new Error('Network error'));

    render(<DeviceList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
    });
  });
});