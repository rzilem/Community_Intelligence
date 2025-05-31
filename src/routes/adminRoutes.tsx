
import React from 'react';
import { UserPlus, ShieldAlert, Settings } from 'lucide-react';
import UserManagementContainer from '@/components/admin/UserManagementContainer';
import SettingsPage from '@/pages/Settings';
import { Route } from './types';

export const adminRoutes: Route[] = [
  {
    path: 'admin/users',
    element: <UserManagementContainer />,
    label: 'User Management',
    icon: UserPlus,
    category: 'admin',
    requiresAuth: true,
    description: 'Manage user accounts and permissions'
  },
  {
    path: 'admin/roles',
    element: <UserManagementContainer />,
    label: 'Role Management',
    icon: ShieldAlert,
    category: 'admin',
    requiresAuth: true,
    description: 'Configure user roles and permissions'
  },
  {
    path: 'settings',
    element: <SettingsPage />,
    label: 'Settings',
    icon: Settings,
    category: 'admin',
    requiresAuth: true,
    description: 'System settings and configuration'
  },
];
