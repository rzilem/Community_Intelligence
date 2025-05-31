
import React from 'react';
import { UserPlus } from 'lucide-react';
import OnboardingTemplatesPage from '@/pages/onboarding/OnboardingTemplatesPage';
import OnboardingTemplateDetailsPage from '@/pages/onboarding/OnboardingTemplateDetailsPage';
import { Route } from './types';

export const onboardingRoutes: Route[] = [
  {
    path: 'onboarding',
    element: <OnboardingTemplatesPage />,
    label: 'Onboarding',
    icon: UserPlus,
    category: 'onboarding',
    requiresAuth: true,
    description: 'Manage onboarding templates'
  },
  {
    path: 'onboarding/:id',
    element: <OnboardingTemplateDetailsPage />,
    label: 'Onboarding Template Details',
    category: 'hidden',
    requiresAuth: true,
  },
];
