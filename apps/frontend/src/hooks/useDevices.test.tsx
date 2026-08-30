import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDevices } from './useDevices';
import type { ReactNode } from 'react';

const listDevicesMock = vi.fn();

vi.mock('../services/api', () => ({
  listDevices: (...args: unknown[]) => listDevicesMock(...args),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const devicesResponse = {
  data: [
    {
      id: 'sensor-1',
      farmId: 'farm-1',
      type: 'AIR_TEMPERATURE',
      label: 'Ambient temperature sensor',
    },
  ],
};

describe('useDevices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data on success', async () => {
    listDevicesMock.mockResolvedValue(devicesResponse);

    const { result } = renderHook(() => useDevices(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(devicesResponse);
    expect(result.current.isError).toBe(false);
    expect(listDevicesMock).toHaveBeenCalled();
  });

  it('returns isError on failure', async () => {
    listDevicesMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDevices(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});