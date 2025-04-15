
import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Permissions from '@/pages/system/Permissions';
import UserProfile from '@/pages/user/UserProfile';
import { AppLayout } from '@/components/layout/AppLayout';

export const mainRoutes = [
  {
    path: '/',
    element: <Index />
  },
  {
    path: '/dashboard',
    element: <AppLayout><Dashboard /></AppLayout>
  },
  {
    path: '/properties',
    element: <Navigate to="/associations" />
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
    element: <AppLayout><Permissions /></AppLayout>
  },
  {
    path: '/user/profile',
    element: <AppLayout><UserProfile /></AppLayout>
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
