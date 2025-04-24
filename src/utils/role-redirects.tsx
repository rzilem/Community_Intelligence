
import { Profile } from '@/types/profile-types';

/**
 * Get the appropriate redirect URL based on user role
 */
export const getRoleBasedRedirect = (profile: Profile): string => {
  switch (profile.role) {
    case 'admin':
      return '/dashboard';
    case 'manager':
      return '/dashboard';
    case 'resident':
      return '/portal/homeowner-dashboard';
    case 'maintenance':
      return '/operations';
    case 'accountant':
      return '/accounting/dashboard';
    case 'board-member':
      return '/portal/board-dashboard';
    case 'vendor':
      return '/portal/vendor-dashboard';
    case 'title-agent':
    case 'real-estate-agent':
      return '/resale-portal/my-orders';
    default:
      return '/dashboard';
  }
};

/**
 * Check if a user with the given role can access the specified path
 */
export const canAccessPath = (userRole: string, path: string): boolean => {
  // Admin and managers can access all paths
  if (userRole === 'admin' || userRole === 'manager') {
    return true;
  }

  // Role-specific path checking
  if (userRole === 'resident') {
    return (
      path.startsWith('/portal/homeowner') || 
      path.startsWith('/dashboard') ||
      path.startsWith('/user/profile')
    );
  }
  
  if (userRole === 'board-member') {
    return (
      path.startsWith('/portal/board') || 
      path.startsWith('/dashboard') ||
      path.startsWith('/user/profile')
    );
  }
  
  if (userRole === 'vendor') {
    return (
      path.startsWith('/portal/vendor') || 
      path.startsWith('/user/profile')
    );
  }
  
  if (userRole === 'maintenance') {
    return (
      path.startsWith('/operations') || 
      path.startsWith('/dashboard') ||
      path.startsWith('/user/profile')
    );
  }
  
  if (userRole === 'accountant') {
    return (
      path.startsWith('/accounting') || 
      path.startsWith('/dashboard') ||
      path.startsWith('/user/profile')
    );
  }
  
  if (userRole === 'real-estate-agent' || userRole === 'title-agent') {
    return (
      path.startsWith('/resale-portal') ||
      path.startsWith('/user/profile')
    );
  }
  
  // Default is to restrict access
  return false;
};
