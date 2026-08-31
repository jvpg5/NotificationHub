import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import EventCard from './EventCard';
import type { EventResponse } from 'shared-types';
import { EventType } from 'shared-types';

const baseEvent: EventResponse = {
  id: 'evt-1',
  farmId: 'farm-1',
  deviceId: 'd1',
  type: EventType.AIR_TEMPERATURE,
  value: 25.4,
  textValue: null,
  unit: '°C',
  timestamp: '2026-08-30T10:00:00.000Z',
  receivedAt: '2026-08-30T10:00:01.000Z',
};

describe('EventCard', () => {
  afterEach(cleanup);
  it('renders all fields', () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByText('AIR_TEMPERATURE')).toBeInTheDocument();
    expect(screen.getByText('25.4 °C')).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    render(<EventCard event={baseEvent} />);

    // toLocaleString output depends on the test environment; verify it contains date parts
    const timestampEl = screen.getByText(/2026/);
    expect(timestampEl).toBeInTheDocument();
  });

  it('shows "—" for null textValue when value is also null', () => {
    const equipmentEvent: EventResponse = {
      ...baseEvent,
      type: EventType.EQUIPMENT_STATUS,
      value: null,
      textValue: null,
      unit: null,
    };

    render(<EventCard event={equipmentEvent} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });
});