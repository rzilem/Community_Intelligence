
import React from 'react';
import { BarChart3 } from 'lucide-react';
import ReportsPage from '@/pages/reporting/ReportsPage';
import { Route } from './types';

export const reportingRoutes: Route[] = [
  {
    path: 'reports',
    element: <ReportsPage />,
    label: 'Reports',
    icon: BarChart3,
    category: 'reporting',
    requiresAuth: true,
    description: 'Create and manage advanced reports with AI insights'
  },
];
