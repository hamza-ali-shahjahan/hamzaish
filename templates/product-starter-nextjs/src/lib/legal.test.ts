import { describe, expect, it, vi } from 'vitest';
import { isUnderAge, MIN_AGE } from '@/lib/legal';

describe('isUnderAge (neutral birth-year gate)', () => {
  const now = new Date('2026-06-01T00:00:00Z');
  it('refuses anyone who could still be under MIN_AGE', () => {
    expect(isUnderAge(now.getFullYear() - MIN_AGE, now)).toBe(true); // may not have had the birthday yet
  });
  it('admits someone certainly over MIN_AGE', () => {
    expect(isUnderAge(now.getFullYear() - MIN_AGE - 1, now)).toBe(false);
  });
  it('rejects nonsense years', () => {
    expect(isUnderAge(1850, now)).toBeNull();
    expect(isUnderAge(now.getFullYear() + 1, now)).toBeNull();
    expect(isUnderAge(Number.NaN, now)).toBeNull();
  });
});

describe('unsubscribe tokens', () => {
  it('round-trips and rejects forgeries', async () => {
    vi.stubEnv('UNSUBSCRIBE_SECRET', 'test-secret-not-real');
    vi.resetModules();
    const { unsubscribeToken, verifyUnsubscribeToken } = await import('@/lib/unsubscribe');
    const token = unsubscribeToken('Someone@Example.com');
    expect(verifyUnsubscribeToken(token)).toBe('someone@example.com');
    const forged = `${Buffer.from('victim@example.com').toString('base64url')}.${token.split('.')[1]}`;
    expect(verifyUnsubscribeToken(forged)).toBeNull();
    expect(verifyUnsubscribeToken('garbage')).toBeNull();
    vi.unstubAllEnvs();
  });
});
