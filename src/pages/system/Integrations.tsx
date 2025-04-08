
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Puzzle } from 'lucide-react';
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
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    },
    {
      name: 'Google Maps',
      status: 'available' as const,
      description: 'Display and manage property locations with Google Maps integration',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      name: 'OpenAI',
      status: 'available' as const,
      description: 'Power AI capabilities throughout the platform with OpenAI integration',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-purple-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      name: 'Plaid',
      status: 'available' as const,
      description: 'Link and manage bank accounts securely with Plaid',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-teal-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    },
    {
      name: 'Eleven Labs',
      status: 'coming-soon' as const,
      description: 'Add voice features to enhance accessibility and user experience',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-pink-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
    },
    {
      name: 'X.AI',
      status: 'coming-soon' as const,
      description: 'Implement advanced analytics capabilities with X.AI integration',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-amber-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
    {
      name: 'Matterport',
      status: 'coming-soon' as const,
      description: 'Create 3D tours of properties for better visualization',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-indigo-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    },
    {
      name: 'Shopify',
      status: 'coming-soon' as const,
      description: 'Enable community e-commerce capabilities with Shopify',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-emerald-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
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
