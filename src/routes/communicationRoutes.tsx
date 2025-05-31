
import React from 'react';
import { FileText, Mail } from 'lucide-react';
import CommunicationTemplates from '@/pages/communications/CommunicationTemplates';
import CommunicationLogs from '@/pages/communications/CommunicationLogs';
import { Route } from './types';

export const communicationRoutes: Route[] = [
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
];
