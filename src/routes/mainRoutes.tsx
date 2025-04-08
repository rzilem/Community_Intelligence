
import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Properties from '@/pages/Properties';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Permissions from '@/pages/system/Permissions';

export const mainRoutes = [
  {
    path: '/',
    element: <Index />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/properties',
    element: <Properties />
  },
  {
    path: '/residents',
    element: <Navigate to="/homeowners" />
  },
  {
    path: '/residents/:id',
    element: <Navigate to="/homeowners/:id" replace />
  },
  {
    path: '/system/permissions',
    element: <Permissions />
  },
  {
    path: '/auth',
    element: <Auth />
  },
  {
    path: '*',
    element: <NotFound />
  }
];
