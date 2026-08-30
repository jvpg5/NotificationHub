import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventType } from 'shared-types';
import { useCreateEvent } from './useCreateEvent';
import type { ReactNode } from 'react';

const createEventMock = vi.fn();

vi.mock('../services/api', () => ({
  createEvent: (...args: unknown[]) => createEventMock(...args),
}));

const eventResponse = {
  id: 'evt-1',
  farmId: 'farm-1',
  deviceId: 'sensor-1',
  type: 'AIR_TEMPERATURE',
  value: 38.5,
  textValue: null,
  unit: 'C',
  timestamp: '2026-08-30T12:00:00.000-03:00',
  receivedAt: '2026-08-30T12:00:01.000-03:00',
};

const dto = {
  eventId: 'evt-1',
  farmId: 'farm-1',
  deviceId: 'sensor-1',
  type: EventType.AIR_TEMPERATURE,
  value: 38.5,
  unit: 'C',
  timestamp: '2026-08-30T12:00:00-03:00',
};

describe('useCreateEvent', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  it('calls createEvent and invalidates queries on success', async () => {
    createEventMock.mockResolvedValue(eventResponse);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateEvent(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(dto);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(createEventMock).toHaveBeenCalledWith(dto);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['events'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] });
  });

  it('returns isError on failure', async () => {
    createEventMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCreateEvent(), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync(dto);
      } catch {
        // expected
      }
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeDefined();
  });
});