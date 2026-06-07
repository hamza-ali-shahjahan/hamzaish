import { describe, expect, it } from 'vitest';
import { cn } from './utils';

// Example unit test — proves the harness is wired. Extend or delete.
describe('cn', () => {
  it('merges class names', () => {
    expect(cn('p-2', 'text-sm')).toBe('p-2 text-sm');
  });

  it('lets the last conflicting tailwind class win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('drops falsy values', () => {
    expect(cn('p-2', false, undefined, null, 'text-sm')).toBe('p-2 text-sm');
  });
});
