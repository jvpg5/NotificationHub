import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

describe('Layout', () => {
  afterEach(cleanup);
  it('renders all navigation links', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /simulator/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /history/i })).toBeInTheDocument();
  });

  it('navigation links point to correct routes', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: /simulator/i })).toHaveAttribute(
      'href',
      '/simulator',
    );
    expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute(
      'href',
      '/history',
    );
  });

  it('highlights active route', () => {
    // At /simulator: Simulator active, Dashboard not active
    const { unmount } = render(
      <MemoryRouter initialEntries={['/simulator']}>
        <Layout />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: /dashboard/i }).className,
    ).not.toContain('text-primary');
    expect(
      screen.getByRole('link', { name: /simulator/i }).className,
    ).toContain('text-primary');

    unmount();

    // At /history: History active, Dashboard not active
    render(
      <MemoryRouter initialEntries={['/history']}>
        <Layout />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: /dashboard/i }).className,
    ).not.toContain('text-primary');
    expect(
      screen.getByRole('link', { name: /history/i }).className,
    ).toContain('text-primary');
  });
});