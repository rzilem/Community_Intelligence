
import React from 'react';
import { Building2 } from 'lucide-react';
import { Dashboard } from '@/pages/Dashboard';
import { Route } from './types';

export const portfolioRoutes: Route[] = [
  {
    path: 'portfolio',
    element: <Dashboard />,
    label: 'Portfolio Manager',
    icon: Building2,
    category: 'main',
    requiresAuth: true,
    description: 'Manage multiple HOA portfolios'
  },
];
