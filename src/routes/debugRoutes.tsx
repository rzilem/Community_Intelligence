
import React from 'react';
import { Bug, Activity, Heart } from 'lucide-react';
import LogViewer from '@/components/debug/LogViewer';
import HealthCheck from '@/components/debug/HealthCheck';
import { Route } from './types';

export const debugRoutes: Route[] = [
  {
    path: 'debug/logs',
    element: <LogViewer />,
    label: 'Debug Logs',
    icon: Bug,
    category: 'debug',
    requiresAuth: false,
    description: 'View application logs and debug information'
  },
  {
    path: 'debug/health',
    element: <HealthCheck />,
    label: 'Health Check',
    icon: Heart,
    category: 'debug',
    requiresAuth: false,
    description: 'Check system health and connectivity'
  },
];
