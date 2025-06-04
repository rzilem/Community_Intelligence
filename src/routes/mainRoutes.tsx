
import React from 'react';
import { Home, Users, Building2, Calendar } from 'lucide-react';
import { Dashboard } from '@/pages/Dashboard';
import Homeowners from '@/pages/Homeowners';
import HomeownerDetailPage from '@/pages/HomeownerDetailPage';
import Associations from '@/pages/Associations';
import CalendarPage from '@/pages/CalendarPage';
import { Route } from './types';

export const mainRoutes: Route[] = [
  {
    path: 'dashboard',
    element: <Dashboard />,
    label: 'Dashboard',
    icon: Home,
    category: 'main',
    requiresAuth: true,
    description: 'Overview of your HOA management dashboard'
  },
  {
    path: 'homeowners',
    element: <Homeowners />,
    label: 'Homeowners',
    icon: Users,
    category: 'main',
    requiresAuth: true,
    description: 'Manage homeowner information and requests'
  },
  {
    path: 'homeowners/:id',
    element: <HomeownerDetailPage />,
    category: 'main',
    requiresAuth: true,
    description: 'Homeowner detail page'
  },
  {
    path: 'associations',
    element: <Associations />,
    label: 'Associations',
    icon: Building2,
    category: 'main',
    requiresAuth: true,
    description: 'Manage HOA associations and properties'
  },
  {
    path: 'events',
    element: <CalendarPage />,
    label: 'Events',
    icon: Calendar,
    category: 'main',
    requiresAuth: true,
    description: 'Schedule and manage HOA events'
  },
];
