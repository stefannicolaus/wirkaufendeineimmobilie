import { describe, it, expect } from 'vitest';
import { validateAdminCredentials, COOKIE_NAME } from '../lib/admin-auth';

describe('validateAdminCredentials', () => {
  it('returns true for matching credentials', () => {
    process.env.ADMIN_USER = 'admin';
    process.env.ADMIN_PASSWORD = 'test123';
    expect(validateAdminCredentials('admin', 'test123')).toBe(true);
  });

  it('returns false for wrong password', () => {
    process.env.ADMIN_USER = 'admin';
    process.env.ADMIN_PASSWORD = 'test123';
    expect(validateAdminCredentials('admin', 'wrong')).toBe(false);
  });

  it('returns false when ENV not set', () => {
    delete process.env.ADMIN_USER;
    delete process.env.ADMIN_PASSWORD;
    expect(validateAdminCredentials('admin', 'anything')).toBe(false);
  });

  it('exports correct cookie name', () => {
    expect(COOKIE_NAME).toBe('wkdi_admin_session');
  });
});
