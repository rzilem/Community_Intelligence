
import React from 'react';
import { Mail, FileText, Bell } from 'lucide-react';
import Communications from '@/pages/Communications';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import { Route } from './types';

export const communicationRoutes: Route[] = [
  {
    path: 'communication-templates',
    element: <Communications />,
    label: 'Templates',
    icon: FileText,
    category: 'communication',
    requiresAuth: true,
    description: 'Manage communication templates'
  },
  {
    path: 'communication-logs',
    element: <Communications />,
    label: 'Logs',
    icon: Mail,
    category: 'communication',
    requiresAuth: true,
    description: 'View communication history and logs'
  },
  {
    path: 'notifications',
    element: <NotificationsPage />,
    label: 'Notifications',
    icon: Bell,
    category: 'communication',
    requiresAuth: true,
    description: 'Automated notification system with AI optimization'
  },
];
