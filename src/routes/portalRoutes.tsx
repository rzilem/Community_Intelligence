
import React from 'react';
import { Layout } from 'lucide-react';
import PortalBuilderPage from '@/pages/portal/PortalBuilderPage';
import { Route } from './types';

export const portalRoutes: Route[] = [
  {
    path: 'portal-builder',
    element: <PortalBuilderPage />,
    label: 'Portal Builder',
    icon: Layout,
    category: 'admin',
    requiresAuth: true,
    description: 'Customize HOA resident portals with drag-drop interface'
  },
];
