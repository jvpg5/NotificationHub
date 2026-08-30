import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import SkeletonCard from './SkeletonCard';

describe('SkeletonCard', () => {
  afterEach(cleanup);

  it('renders skeleton with animate-pulse class', () => {
    const { container } = render(<SkeletonCard />);

    const pulseElement = container.querySelector('.animate-pulse');
    expect(pulseElement).toBeInTheDocument();
  });

  it('renders 3 line-divs when lines > 2 (default lines=3)', () => {
    const { container } = render(<SkeletonCard />);

    const lines = container.querySelectorAll('.h-4.bg-muted');
    expect(lines).toHaveLength(3);
  });

  it('renders only 2 line-divs when lines=1', () => {
    const { container } = render(<SkeletonCard lines={1} />);

    const lines = container.querySelectorAll('.h-4.bg-muted');
    expect(lines).toHaveLength(2);
  });
});