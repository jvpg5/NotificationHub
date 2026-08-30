import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import NotificationCard from './NotificationCard';
import type { NotificationResponse } from 'shared-types';
import { Severity, NotificationStatus, EventType } from 'shared-types';

const baseNotification: NotificationResponse = {
  id: 'notif-1',
  eventId: 'evt-1',
  farmId: 'farm-1',
  deviceId: 'd1',
  eventType: EventType.AIR_TEMPERATURE,
  eventValue: 42,
  ruleTriggered: 'AIR_TEMPERATURE_HIGH',
  severity: Severity.WARNING,
  message: 'Air temperature is critically high: 42°C',
  status: NotificationStatus.PENDING,
  sentAt: null,
  failureReason: null,
  createdAt: '2026-08-30T10:05:00.000Z',
  updatedAt: '2026-08-30T10:05:00.000Z',
};

describe('NotificationCard', () => {
  afterEach(cleanup);
  it('renders message', () => {
    render(<NotificationCard notification={baseNotification} />);

    expect(
      screen.getByText('Air temperature is critically high: 42°C'),
    ).toBeInTheDocument();
  });

  it('severity badge has correct class per variant — WARNING', () => {
    render(<NotificationCard notification={baseNotification} />);

    const badge = screen.getByText('WARNING');
    expect(badge.className).toContain('bg-severity-warning/10');
    expect(badge.className).toContain('text-severity-warning');
  });

  it('severity badge has correct class per variant — CRITICAL', () => {
    render(
      <NotificationCard
        notification={{ ...baseNotification, severity: Severity.CRITICAL }}
      />,
    );

    const badge = screen.getByText('CRITICAL');
    expect(badge.className).toContain('bg-severity-critical/10');
    expect(badge.className).toContain('text-severity-critical');
  });

  it('severity badge has correct class per variant — INFO', () => {
    render(
      <NotificationCard
        notification={{ ...baseNotification, severity: Severity.INFO }}
      />,
    );

    const badge = screen.getByText('INFO');
    expect(badge.className).toContain('bg-severity-info/10');
    expect(badge.className).toContain('text-severity-info');
  });

  it('status badge has correct class per variant — SENT', () => {
    render(
      <NotificationCard
        notification={{
          ...baseNotification,
          status: NotificationStatus.SENT,
          sentAt: '2026-08-30T10:06:00.000Z',
        }}
      />,
    );

    const badge = screen.getByText('SENT');
    expect(badge.className).toContain('bg-status-sent/10');
    expect(badge.className).toContain('text-status-sent');
  });

  it('status badge has correct class per variant — FAILED', () => {
    render(
      <NotificationCard
        notification={{
          ...baseNotification,
          status: NotificationStatus.FAILED,
        }}
      />,
    );

    const badge = screen.getByText('FAILED');
    expect(badge.className).toContain('bg-status-failed/10');
    expect(badge.className).toContain('text-status-failed');
  });

  it('status badge has correct class per variant — PENDING', () => {
    render(<NotificationCard notification={baseNotification} />);

    const badge = screen.getByText('PENDING');
    expect(badge.className).toContain('bg-status-pending/10');
    expect(badge.className).toContain('text-status-pending');
  });

  it('shows sentAt when status is SENT', () => {
    render(
      <NotificationCard
        notification={{
          ...baseNotification,
          status: NotificationStatus.SENT,
          sentAt: '2026-08-30T10:06:00.000Z',
        }}
      />,
    );

    expect(screen.getByText(/Sent/)).toBeInTheDocument();
  });
});