
import React from 'react';
import { Users, BarChart3, Mail, FileText, UserPlus, Briefcase } from 'lucide-react';
import LeadManagement from '@/pages/lead-management/LeadManagement';
import LeadsDashboard from '@/pages/lead-management/LeadsDashboard';
import Proposals from '@/pages/lead-management/Proposals';
import EmailCampaigns from '@/pages/lead-management/EmailCampaigns';
import Analytics from '@/pages/lead-management/Analytics';
import OnboardingWizard from '@/pages/lead-management/OnboardingWizard';
import Templates from '@/pages/lead-management/Templates';
import LeadDetailPage from '@/components/leads/LeadDetailPage';
import TemplateDetails from '@/components/onboarding/TemplateDetails';
import { Route } from './types';

export const leadManagementRoutes: Route[] = [
  {
    path: 'lead-management',
    element: <LeadManagement />,
    label: 'Lead Management',
    icon: Users,
    category: 'lead-management',
    requiresAuth: true,
    description: 'Manage and track potential new clients'
  },
  {
    path: 'lead-management/dashboard',
    element: <LeadsDashboard />,
    label: 'Leads Dashboard',
    category: 'lead-management',
    requiresAuth: true,
    description: 'View and manage all incoming leads'
  },
  {
    path: 'lead-management/proposals',
    element: <Proposals />,
    label: 'Proposals',
    category: 'lead-management',
    requiresAuth: true,
    description: 'Create and track client proposals'
  },
  {
    path: 'lead-management/email-campaigns',
    element: <EmailCampaigns />,
    label: 'Email Campaigns',
    category: 'lead-management',
    requiresAuth: true,
    description: 'Create and manage email marketing campaigns'
  },
  {
    path: 'lead-management/analytics',
    element: <Analytics />,
    label: 'Analytics',
    category: 'lead-management',
    requiresAuth: true,
    description: 'Track conversion metrics and lead sources'
  },
  {
    path: 'lead-management/onboarding',
    element: <OnboardingWizard />,
    category: 'lead-management',
    requiresAuth: true,
    description: 'Manage community onboarding processes'
  },
  {
    path: 'lead-management/onboarding/:projectId',
    element: <OnboardingWizard />,
    category: 'lead-management',
    requiresAuth: true,
    description: 'View onboarding project details'
  },
  {
    path: 'lead-management/onboarding/templates/:templateId',
    element: <TemplateDetails />,
    category: 'lead-management',
    requiresAuth: true,
    description: 'View onboarding template details'
  },
  {
    path: 'lead-management/templates',
    element: <Templates />,
    label: 'Templates',
    category: 'lead-management',
    requiresAuth: true,
    description: 'Create and manage common templates'
  },
  {
    path: 'lead-management/leads/:leadId',
    element: <LeadDetailPage />,
    category: 'lead-management',
    requiresAuth: true,
    description: 'View lead details'
  },
];
