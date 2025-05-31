
import React from 'react';
import { UserPlus, ShieldAlert, Settings } from 'lucide-react';
import UserManagement from '@/components/users/UserManagement';
import Settings as SettingsPage from '@/pages/Settings';
import { Route } from './types';

export const adminRoutes: Route[] = [
  {
    path: 'admin/users',
    element: <UserManagement />,
    label: 'User Management',
    icon: UserPlus,
    category: 'admin',
    requiresAuth: true,
    description: 'Manage user accounts and permissions'
  },
  {
    path: 'admin/roles',
    element: <UserManagement />,
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
