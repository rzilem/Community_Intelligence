
import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Properties from '@/pages/Properties';
import Homeowners from '@/pages/Residents';
import ResidentDetailPage from '@/pages/ResidentDetailPage';
import NotFound from '@/pages/NotFound';

export const mainRoutes = [
  {
    path: '/',
    element: <Navigate to="/dashboard" />
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
    path: '/homeowners',
    element: <Homeowners />
  },
  {
    path: '/homeowners/:id',
    element: <ResidentDetailPage />
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
    path: '*',
    element: <NotFound />
  }
];
