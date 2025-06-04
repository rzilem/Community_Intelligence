
import React from 'react';
import { CreditCard } from 'lucide-react';
import BillingDashboard from '@/pages/billing/BillingDashboard';
import AssessmentManager from '@/pages/billing/AssessmentManager';
import { Route } from './types';

export const billingRoutes: Route[] = [
  {
    path: 'billing',
    element: <BillingDashboard />,
    label: 'Billing',
    icon: CreditCard,
    category: 'billing',
    requiresAuth: true,
    description: 'Manage billing and payments'
  },
  {
    path: 'billing/assessments',
    element: <AssessmentManager />,
    label: 'Assessment Manager',
    category: 'billing',
    requiresAuth: true,
    description: 'Manage HOA assessments'
  },
];
