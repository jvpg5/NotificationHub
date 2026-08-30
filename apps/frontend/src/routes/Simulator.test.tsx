import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Simulator from './Simulator';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const listDevicesMock = vi.fn();

vi.mock('../services/api', async () => {
  const actual =
    await vi.importActual<typeof import('../services/api')>(
      '../services/api',
    );
  return {
    ...actual,
    listDevices: (...args: unknown[]) => listDevicesMock(...args),
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
// Test
// ---------------------------------------------------------------------------

describe('Simulator route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listDevicesMock.mockResolvedValue({
      data: [
        {
          id: 'sensor-temp-01',
          farmId: 'farm-001',
          type: 'AIR_TEMPERATURE',
          label: 'Temp Sensor',
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the simulator page with heading and form', async () => {
    render(<Simulator />, { wrapper });

    // Heading is rendered
    expect(screen.getByText('Event Simulator')).toBeInTheDocument();

    // SimulatorForm is rendered (check for a known label/element after devices load)
    await waitFor(() => {
      expect(screen.getByText('Submit Event')).toBeInTheDocument();
    });

    // Quick Presets section is present
    expect(screen.getByText('Quick Presets')).toBeInTheDocument();
  });
});