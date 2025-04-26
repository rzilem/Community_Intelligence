
import React from 'react';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import { RequireAuth } from '@/components/auth/RequireAuth';
import ConfirmAuth from '@/components/auth/ConfirmAuth';

export const mainRoutes = [
  {
    path: "/",
    element: <Index />
  },
  {
    path: "/dashboard",
    element: <RequireAuth><Dashboard /></RequireAuth>
  },
  {
    path: "/auth/confirm",
    element: <ConfirmAuth />
  },
  {
    path: "*",
    element: <NotFound />
  }
];
