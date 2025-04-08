
import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Properties from '@/pages/Properties';
import Residents from '@/pages/Residents';
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
    path: '/residents',
    element: <Residents />
  },
  {
    path: '/residents/:id',
    element: <ResidentDetailPage />
  },
  {
    path: '*',
    element: <NotFound />
  }
];
