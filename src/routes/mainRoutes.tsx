
import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Permissions from '@/pages/system/Permissions';
import UserProfile from '@/pages/user/UserProfile';
import AllActions from '@/pages/AllActions';
import DesignShowcase from '@/pages/DesignShowcase';

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
    path: '/dashboard/actions',
    element: <AllActions />
  },
  {
    path: '/design-showcase',
    element: <DesignShowcase />
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
    element: <Permissions />
  },
  {
    path: '/user/profile',
    element: <UserProfile />
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
