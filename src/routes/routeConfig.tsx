import React from 'react';
import { Home, Users, Building2, Settings, FileText, Calendar, Mail, CheckSquare, UserPlus, ShieldAlert, Brain, MessageSquare } from 'lucide-react';
import {
  IndexRouteObject,
  NonIndexRouteObject,
} from 'react-router-dom';

import Dashboard from '@/pages/Dashboard';
import Homeowners from '@/pages/homeowners/Homeowners';
import HomeownerDetailPage from '@/pages/HomeownerDetailPage';
import Associations from '@/pages/Associations';
import AssociationDetail from '@/pages/AssociationDetail';
import SettingsPage from '@/pages/SettingsPage';
import CommunicationTemplates from '@/pages/communication/CommunicationTemplates';
import CommunicationLogs from '@/pages/communication/CommunicationLogs';
import EventsCalendar from '@/pages/EventsCalendar';
import AssessmentManager from '@/pages/billing/AssessmentManager';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import RoleManagementPage from '@/pages/admin/RoleManagementPage';
import OnboardingTemplatesPage from '@/pages/onboarding/OnboardingTemplatesPage';
import OnboardingTemplateDetailsPage from '@/pages/onboarding/OnboardingTemplateDetailsPage';
import AIQueryPage from '@/pages/ai/AIQueryPage';

export type Route = (IndexRouteObject | NonIndexRouteObject) & {
  label?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category?: string;
  requiresAuth?: boolean;
  description?: string;
};

export const protectedRoutes: Route[] = [
  {
    path: 'dashboard',
    element: <Dashboard />,
    label: 'Dashboard',
    icon: Home,
    category: 'main',
    requiresAuth: true,
  },
  {
    path: 'homeowners',
    element: <Homeowners />,
    label: 'Homeowners',
    icon: Users,
    category: 'main',
    requiresAuth: true,
    description: 'Manage homeowners and residents'
  },
  {
    path: 'homeowners/:id',
    element: <HomeownerDetailPage />,
    label: 'Homeowner Detail',
    category: 'hidden',
    requiresAuth: true,
  },
  {
    path: 'associations',
    element: <Associations />,
    label: 'Associations',
    icon: Building2,
    category: 'main',
    requiresAuth: true,
    description: 'Manage associations and properties'
  },
   {
    path: 'associations/:id',
    element: <AssociationDetail />,
    label: 'Association Detail',
    category: 'hidden',
    requiresAuth: true,
  },
  {
    path: 'settings',
    element: <SettingsPage />,
    label: 'Settings',
    icon: Settings,
    category: 'admin',
    requiresAuth: true,
    description: 'Manage application settings'
  },
  {
    path: 'communication-templates',
    element: <CommunicationTemplates />,
    label: 'Communication Templates',
    icon: FileText,
    category: 'communication',
    requiresAuth: true,
    description: 'Manage communication templates'
  },
  {
    path: 'communication-logs',
    element: <CommunicationLogs />,
    label: 'Communication Logs',
    icon: Mail,
    category: 'communication',
    requiresAuth: true,
    description: 'View communication logs'
  },
  {
    path: 'events',
    element: <EventsCalendar />,
    label: 'Events',
    icon: Calendar,
    category: 'main',
    requiresAuth: true,
    description: 'Manage events calendar'
  },
  {
    path: 'billing',
    element: <AssessmentManager />,
    label: 'Billing',
    icon: CheckSquare,
    category: 'billing',
    requiresAuth: true,
    description: 'Manage billing and assessments'
  },
  {
    path: 'admin/users',
    element: <UserManagementPage />,
    label: 'User Management',
    icon: UserPlus,
    category: 'admin',
    requiresAuth: true,
    description: 'Manage users and roles'
  },
  {
    path: 'admin/roles',
    element: <RoleManagementPage />,
    label: 'Role Management',
    icon: ShieldAlert,
    category: 'admin',
    requiresAuth: true,
    description: 'Manage roles and permissions'
  },
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
  
  // AI Features - MILESTONE 4
  {
    path: 'ai-query',
    element: <AIQueryPage />,
    label: 'AI Query',
    icon: Brain,
    category: 'ai',
    requiresAuth: true,
    description: 'Ask questions about your data using natural language'
  },
];

export const navigationItems = [
  {
    category: 'main',
    label: 'Main',
    icon: Home,
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
      { path: '/homeowners', label: 'Homeowners', icon: Users },
      { path: '/associations', label: 'Associations', icon: Building2 },
      { path: '/events', label: 'Events', icon: Calendar },
    ]
  },
  {
    category: 'communication',
    label: 'Communication',
    icon: Mail,
    items: [
      { path: '/communication-templates', label: 'Templates', icon: FileText },
      { path: '/communication-logs', label: 'Logs', icon: Mail },
    ]
  },
  {
    category: 'billing',
    label: 'Billing',
    icon: CheckSquare,
    items: [
      { path: '/billing', label: 'Assessments', icon: CheckSquare },
    ]
  },
  {
    category: 'onboarding',
    label: 'Onboarding',
    icon: UserPlus,
    items: [
      { path: '/onboarding', label: 'Templates', icon: FileText },
    ]
  },
  {
    category: 'admin',
    label: 'Administration',
    icon: Settings,
    items: [
      { path: '/admin/users', label: 'User Management', icon: UserPlus },
      { path: '/admin/roles', label: 'Role Management', icon: ShieldAlert },
      { path: '/settings', label: 'Settings', icon: Settings },
    ]
  },
  {
    category: 'ai',
    label: 'AI Features',
    icon: Brain,
    items: [
      { path: '/ai-query', label: 'AI Query', icon: MessageSquare },
      // Future AI features will be added here
    ]
  },
];
