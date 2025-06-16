import { describe, expect, it } from 'vitest';
import { isAdminRole } from './role-utils';

describe('isAdminRole', () => {
  it('returns true for admin role', () => {
    expect(isAdminRole('admin')).toBe(true);
  });

  it('returns true for system_admin role', () => {
    expect(isAdminRole('system_admin')).toBe(true);
  });

  it('returns true for global_admin role', () => {
    expect(isAdminRole('global_admin')).toBe(true);
  });

  it('returns false for non admin role', () => {
    expect(isAdminRole('user')).toBe(false);
  });

  it('returns false for null or undefined', () => {
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});
