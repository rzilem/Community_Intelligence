
import React from 'react';
import { CheckSquare } from 'lucide-react';
import AssessmentManager from '@/pages/billing/AssessmentManager';
import { Route } from './types';

export const billingRoutes: Route[] = [
  {
    path: 'billing',
    element: <AssessmentManager />,
    label: 'Billing',
    icon: CheckSquare,
    category: 'billing',
    requiresAuth: true,
    description: 'Manage billing and assessments'
  },
];
