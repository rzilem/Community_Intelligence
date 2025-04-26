
import React from 'react';
import { Route } from 'react-router-dom';

import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import { RequireAuth } from '@/components/auth/RequireAuth';
import ConfirmAuth from '@/components/auth/ConfirmAuth';

export const mainRoutes = (
  <>
    <Route path="/" element={<Index />} />
    <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
    <Route path="/auth/confirm" element={<ConfirmAuth />} />
    <Route path="*" element={<NotFound />} />
  </>
);
