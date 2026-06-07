import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// Example component test — replace the inline component with a real one from
// src/components once you have something worth asserting on.
function Hello({ name }: { name: string }) {
  return <h1>Hello {name}</h1>;
}

describe('Hello', () => {
  it('renders the name', () => {
    render(<Hello name="Hamzaish" />);
    expect(screen.getByRole('heading', { name: /hello hamzaish/i })).toBeInTheDocument();
  });
});
