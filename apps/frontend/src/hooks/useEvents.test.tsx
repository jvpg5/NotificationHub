import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvents } from './useEvents';
import type { ReactNode } from 'react';

const listEventsMock = vi.fn();

vi.mock('../services/api', () => ({
  listEvents: (...args: unknown[]) => listEventsMock(...args),
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

const paginatedResponse = {
  data: [
    {
      id: 'evt-1',
      farmId: 'farm-1',
      deviceId: 'sensor-1',
      type: 'AIR_TEMPERATURE',
      value: 38.5,
      textValue: null,
      unit: 'C',
      timestamp: '2026-08-30T12:00:00.000-03:00',
      receivedAt: '2026-08-30T12:00:01.000-03:00',
    },
  ],
  total: 1,
};

describe('useEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data on success', async () => {
    listEventsMock.mockResolvedValue(paginatedResponse);

    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(paginatedResponse);
    expect(result.current.isError).toBe(false);
    expect(listEventsMock).toHaveBeenCalled();
  });

  it('returns isError on failure', async () => {
    listEventsMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});