import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  afterEach(cleanup);

  it('renders default message', () => {
    render(<ErrorState />);

    expect(
      screen.getByText('Failed to load data. Check if the backend is running.'),
    ).toBeInTheDocument();
  });

  it('renders custom message when provided', () => {
    render(<ErrorState message="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});