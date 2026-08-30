import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications } from './useNotifications';
import type { ReactNode } from 'react';

const listNotificationsMock = vi.fn();

vi.mock('../services/api', () => ({
  listNotifications: (...args: unknown[]) => listNotificationsMock(...args),
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
      id: 'notif-1',
      eventId: 'evt-1',
      farmId: 'farm-1',
      deviceId: 'sensor-1',
      eventType: 'AIR_TEMPERATURE',
      eventValue: 38.5,
      ruleTriggered: 'AIR_TEMPERATURE_HIGH',
      severity: 'WARNING',
      message: 'Temperature alert',
      status: 'SENT',
      sentAt: '2026-08-30T12:00:01.000-03:00',
      failureReason: null,
      createdAt: '2026-08-30T12:00:00.000-03:00',
      updatedAt: '2026-08-30T12:00:01.000-03:00',
    },
  ],
  total: 1,
};

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data on success', async () => {
    listNotificationsMock.mockResolvedValue(paginatedResponse);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(paginatedResponse);
    expect(result.current.isError).toBe(false);
    expect(listNotificationsMock).toHaveBeenCalled();
  });

  it('returns isError on failure', async () => {
    listNotificationsMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});