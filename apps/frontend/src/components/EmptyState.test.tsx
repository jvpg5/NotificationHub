import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  afterEach(cleanup);

  it('renders title', () => {
    render(<EmptyState title="No notifications found" />);

    expect(screen.getByText('No notifications found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        title="No events"
        description="Try adjusting your filters"
      />,
    );

    expect(screen.getByText('No events')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your filters'),
    ).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<EmptyState title="Nothing here" />);

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(
      screen.queryByText('Try adjusting your filters'),
    ).not.toBeInTheDocument();
  });
});