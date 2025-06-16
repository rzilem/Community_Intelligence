export const ADMIN_ROLES = ['admin', 'system_admin', 'global_admin'] as const;

export type AdminRole = typeof ADMIN_ROLES[number];

export const isAdminRole = (role: string | null | undefined): boolean => {
  return role ? ADMIN_ROLES.includes(role as AdminRole) : false;
};
