
import { Profile } from '@/types/profile-types';

type RedirectMap = {
  [key: string]: string;
};

const DEFAULT_REDIRECT = '/dashboard';

/**
 * Default role-based redirect paths
 */
const roleRedirectMap: RedirectMap = {
  admin: '/system/settings',
  manager: '/community-management',
  treasurer: '/accounting/dashboard',
  resident: '/portal/homeowner',
  maintenance: '/operations/dashboard',
  accountant: '/accounting/dashboard',
  'board-member': '/portal/board',
  vendor: '/portal/vendor',
  default: DEFAULT_REDIRECT,
};

/**
 * Get the appropriate redirect path based on user profile
 */
export const getRoleBasedRedirect = (profile: Profile | null): string => {
  if (!profile || !profile.role) {
    return DEFAULT_REDIRECT;
  }

  return roleRedirectMap[profile.role] || roleRedirectMap.default;
};

/**
 * Check if a user with the given role can access a specific path
 */
export const canAccessPath = (role: string | null, path: string): boolean => {
  if (!role) return false;

  // Define path access patterns
  const pathPatterns: Record<string, RegExp[]> = {
    resident: [
      /^\/dashboard$/,
      /^\/portal\/homeowner/,
      /^\/user\/profile/,
    ],
    'board-member': [
      /^\/dashboard$/,
      /^\/portal\/board/,
      /^\/user\/profile/,
      /^\/community-management/,
    ],
    treasurer: [
      /^\/dashboard$/,
      /^\/accounting/,
      /^\/user\/profile/,
      /^\/community-management/,
    ],
    maintenance: [
      /^\/dashboard$/,
      /^\/operations/,
      /^\/user\/profile/,
    ],
    manager: [
      /^\/dashboard$/,
      /^\/community-management/,
      /^\/accounting/,
      /^\/operations/,
      /^\/user\/profile/,
    ],
    admin: [/./], // Admin can access everything
  };

  // If role has no defined patterns, use default access
  if (!pathPatterns[role]) {
    return true;
  }

  // Check if any pattern matches the path
  return pathPatterns[role].some(pattern => pattern.test(path));
};
