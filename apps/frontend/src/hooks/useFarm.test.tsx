import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFarm } from './useFarm';
import type { ReactNode } from 'react';

const getFarmMock = vi.fn();

vi.mock('../services/api', () => ({
  getFarm: (...args: unknown[]) => getFarmMock(...args),
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

const farmResponse = {
  id: 'farm-1',
  name: 'Fazenda Boa Esperança',
  producer: 'João Silva',
  phone: '+5535999999999',
};

describe('useFarm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data on success', async () => {
    getFarmMock.mockResolvedValue(farmResponse);

    const { result } = renderHook(() => useFarm(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(farmResponse);
    expect(result.current.isError).toBe(false);
    expect(getFarmMock).toHaveBeenCalled();
  });

  it('returns isError on failure', async () => {
    getFarmMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFarm(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});