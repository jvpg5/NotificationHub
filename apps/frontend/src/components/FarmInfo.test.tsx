import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FarmInfo from './FarmInfo';
import type { ReactNode } from 'react';

const getFarmMock = vi.fn();

vi.mock('../services/api', () => ({
  getFarm: (...args: unknown[]) => getFarmMock(...args),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
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

describe('FarmInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders farm name, producer, and phone on success', async () => {
    getFarmMock.mockResolvedValue(farmResponse);

    render(<FarmInfo />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Fazenda Boa Esperança')).toBeInTheDocument();
    });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('+5535999999999')).toBeInTheDocument();
  });

  it('shows skeleton while loading', () => {
    getFarmMock.mockReturnValue(new Promise(() => {})); // never resolves

    render(<FarmInfo />, { wrapper });

    // SkeletonCard renders divs with bg-muted and animate-pulse
    const skeletonContainer = document.querySelector('.animate-pulse');
    expect(skeletonContainer).toBeInTheDocument();
  });

  it('shows error message on failure', async () => {
    getFarmMock.mockRejectedValue(new Error('Network error'));

    render(<FarmInfo />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load data/i),
      ).toBeInTheDocument();
    });
  });
});