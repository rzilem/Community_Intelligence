
import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Properties from '@/pages/Properties';
import Homeowners from '@/pages/Homeowners'; // Updated import
import HomeownerDetailPage from '@/pages/HomeownerDetailPage'; // Updated import
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
    element: <HomeownerDetailPage />
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
