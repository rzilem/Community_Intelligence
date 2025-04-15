
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Puzzle, CreditCard, Map, LightningBolt, Wallet, Mic, BarChart3, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const IntegrationCard = ({ name, status, description, icon }: { 
  name: string; 
  status: 'connected' | 'available' | 'coming-soon'; 
  description: string;
  icon: React.ReactNode; 
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <CardTitle className="text-lg">{name}</CardTitle>
        </div>
        <Badge variant={status === 'connected' ? 'default' : status === 'available' ? 'outline' : 'secondary'}>
          {status === 'connected' ? 'Connected' : status === 'available' ? 'Available' : 'Coming Soon'}
        </Badge>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

const Integrations = () => {
  const integrations = [
    {
      name: 'Stripe',
      status: 'available' as const,
      description: 'Process payments for assessments and fees through Stripe',
      icon: <CreditCard className="h-6 w-6 text-blue-500" />,
    },
    {
      name: 'Google Maps',
      status: 'available' as const,
      description: 'Display and manage property locations with Google Maps integration',
      icon: <Map className="h-6 w-6 text-green-500" />,
    },
    {
      name: 'OpenAI',
      status: 'available' as const,
      description: 'Power AI capabilities throughout the platform with OpenAI integration',
      icon: <LightningBolt className="h-6 w-6 text-purple-500" />,
    },
    {
      name: 'Plaid',
      status: 'available' as const,
      description: 'Link and manage bank accounts securely with Plaid',
      icon: <Wallet className="h-6 w-6 text-teal-500" />,
    },
    {
      name: 'Eleven Labs',
      status: 'coming-soon' as const,
      description: 'Add voice features to enhance accessibility and user experience',
      icon: <Mic className="h-6 w-6 text-pink-500" />,
    },
    {
      name: 'X.AI',
      status: 'coming-soon' as const,
      description: 'Implement advanced analytics capabilities with X.AI integration',
      icon: <BarChart3 className="h-6 w-6 text-amber-500" />,
    },
    {
      name: 'Matterport',
      status: 'coming-soon' as const,
      description: 'Create 3D tours of properties for better visualization',
      icon: <Home className="h-6 w-6 text-indigo-500" />,
    },
    {
      name: 'Shopify',
      status: 'coming-soon' as const,
      description: 'Enable community e-commerce capabilities with Shopify',
      icon: <ShoppingBag className="h-6 w-6 text-emerald-500" />,
    }
  ];

  return (
    <PageTemplate 
      title="Integrations" 
      icon={<Puzzle className="h-8 w-8" />}
      description="Configure and manage third-party system integrations."
    >
      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration, index) => (
            <IntegrationCard 
              key={index}
              name={integration.name}
              status={integration.status}
              description={integration.description}
              icon={integration.icon}
            />
          ))}
        </div>
      </div>
    </PageTemplate>
  );
};

export default Integrations;
