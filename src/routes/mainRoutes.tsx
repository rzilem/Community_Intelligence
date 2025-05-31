
import React from 'react';
import { Home, Users, Building2, Calendar } from 'lucide-react';
import Dashboard from '@/pages/Dashboard';
import HomeownerListPage from '@/pages/homeowners/HomeownerListPage';
import HomeownerDetailPage from '@/pages/HomeownerDetailPage';
import Associations from '@/pages/Associations';
import AssociationDetail from '@/pages/system/AssociationProfile';
import EventsCalendar from '@/pages/CalendarPage';
import { Route } from './types';

export const mainRoutes: Route[] = [
  {
    path: 'dashboard',
    element: <Dashboard />,
    label: 'Dashboard',
    icon: Home,
    category: 'main',
    requiresAuth: true,
  },
  {
    path: 'homeowners',
    element: <HomeownerListPage />,
    label: 'Homeowners',
    icon: Users,
    category: 'main',
    requiresAuth: true,
    description: 'Manage homeowners and residents'
  },
  {
    path: 'homeowners/:id',
    element: <HomeownerDetailPage />,
    label: 'Homeowner Detail',
    category: 'hidden',
    requiresAuth: true,
  },
  {
    path: 'associations',
    element: <Associations />,
    label: 'Associations',
    icon: Building2,
    category: 'main',
    requiresAuth: true,
    description: 'Manage associations and properties'
  },
   {
    path: 'associations/:id',
    element: <AssociationDetail />,
    label: 'Association Detail',
    category: 'hidden',
    requiresAuth: true,
  },
  {
    path: 'events',
    element: <EventsCalendar />,
    label: 'Events',
    icon: Calendar,
    category: 'main',
    requiresAuth: true,
    description: 'Manage events calendar'
  },
];
