
import React from 'react';
import { Bell } from 'lucide-react';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import { Route } from './types';

export const notificationRoutes: Route[] = [
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
