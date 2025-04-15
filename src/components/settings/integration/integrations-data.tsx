
import React from 'react';
import { LightningBolt, CreditCard, Map, Wallet, Mic, BarChart3 } from 'lucide-react';

export interface IntegrationData {
  name: string;
  description: string;
  icon: React.ReactNode;
  configFields: string[];
  configDate?: string;
}

export const getIntegrationsData = (): IntegrationData[] => [
  {
    name: 'OpenAI',
    description: 'Power AI capabilities throughout the platform with OpenAI integration',
    icon: <LightningBolt className="h-6 w-6 text-purple-500" />,
    configFields: ['apiKey', 'model']
  },
  {
    name: 'Stripe',
    description: 'Process payments for assessments and fees through Stripe',
    icon: <CreditCard className="h-6 w-6 text-blue-500" />,
    configFields: ['apiKey', 'webhookSecret']
  },
  {
    name: 'Google Maps',
    description: 'Display and manage property locations with Google Maps integration',
    icon: <Map className="h-6 w-6 text-green-500" />,
    configFields: ['apiKey']
  },
  {
    name: 'Plaid',
    description: 'Link and manage bank accounts securely with Plaid',
    icon: <Wallet className="h-6 w-6 text-teal-500" />,
    configFields: ['clientId', 'secret']
  },
  {
    name: 'Eleven Labs',
    description: 'Add voice features to enhance accessibility and user experience',
    icon: <Mic className="h-6 w-6 text-pink-500" />,
    configFields: []
  },
  {
    name: 'X.AI',
    description: 'Implement advanced analytics capabilities with X.AI integration',
    icon: <BarChart3 className="h-6 w-6 text-amber-500" />,
    configFields: []
  }
];

// Helper to format dates consistently
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};
