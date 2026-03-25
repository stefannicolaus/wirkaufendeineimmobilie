import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, _resetForTests } from '../lib/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => _resetForTests());

  it('allows requests within limit', () => {
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit('1.2.3.4')).toBe(true);
    }
  });

  it('blocks 31st request', () => {
    for (let i = 0; i < 30; i++) checkRateLimit('1.2.3.4');
    expect(checkRateLimit('1.2.3.4')).toBe(false);
  });

  it('different IPs are independent', () => {
    for (let i = 0; i < 30; i++) checkRateLimit('1.1.1.1');
    expect(checkRateLimit('2.2.2.2')).toBe(true);
  });
});
