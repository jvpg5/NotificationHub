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

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Simulator' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'History' })).toBeInTheDocument();
  });

  it('navigation links point to correct routes', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Simulator' })).toHaveAttribute(
      'href',
      '/simulator',
    );
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute(
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
      screen.getByRole('link', { name: 'Dashboard' }).className,
    ).not.toContain('active');
    expect(
      screen.getByRole('link', { name: 'Simulator' }).className,
    ).toContain('active');

    unmount();

    // At /history: History active, Dashboard not active
    render(
      <MemoryRouter initialEntries={['/history']}>
        <Layout />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Dashboard' }).className,
    ).not.toContain('active');
    expect(
      screen.getByRole('link', { name: 'History' }).className,
    ).toContain('active');
  });
});