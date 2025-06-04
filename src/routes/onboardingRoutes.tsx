
import React from 'react';
import { UserPlus } from 'lucide-react';
import OnboardingDashboard from '@/pages/onboarding/OnboardingDashboard';
import { Route } from './types';

export const onboardingRoutes: Route[] = [
  {
    path: 'onboarding',
    element: <OnboardingDashboard />,
    label: 'Onboarding',
    icon: UserPlus,
    category: 'onboarding',
    requiresAuth: true,
    description: 'Manage resident onboarding'
  },
  {
    path: 'onboarding/:id',
    element: <OnboardingDashboard />,
    category: 'onboarding',
    requiresAuth: true,
    description: 'View onboarding details'
  },
];
