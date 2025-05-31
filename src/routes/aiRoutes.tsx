
import React from 'react';
import { Brain } from 'lucide-react';
import AIQueryPage from '@/pages/ai/AIQueryPage';
import { Route } from './types';

export const aiRoutes: Route[] = [
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
