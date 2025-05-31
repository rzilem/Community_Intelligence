
import React from 'react';
import { Settings, UserPlus, ShieldAlert } from 'lucide-react';
import SettingsPage from '@/pages/Settings';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import RoleManagementPage from '@/pages/admin/RoleManagementPage';
import { Route } from './types';

export const adminRoutes: Route[] = [
  {
    path: 'settings',
    element: <SettingsPage />,
    label: 'Settings',
    icon: Settings,
    category: 'admin',
    requiresAuth: true,
    description: 'Manage application settings'
  },
  {
    path: 'admin/users',
    element: <UserManagementPage />,
    label: 'User Management',
    icon: UserPlus,
    category: 'admin',
    requiresAuth: true,
    description: 'Manage users and roles'
  },
  {
    path: 'admin/roles',
    element: <RoleManagementPage />,
    label: 'Role Management',
    icon: ShieldAlert,
    category: 'admin',
    requiresAuth: true,
    description: 'Manage roles and permissions'
  },
];
