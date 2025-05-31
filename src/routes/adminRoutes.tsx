
import React from 'react';
import { UserPlus, ShieldAlert, Settings } from 'lucide-react';
import SettingsPage from '@/pages/Settings';
import UserManagement from '@/components/admin/UserManagement';
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
