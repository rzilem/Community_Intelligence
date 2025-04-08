
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Puzzle } from 'lucide-react';

const Integrations = () => {
  return <PageTemplate 
    title="Integrations" 
    icon={<Puzzle className="h-8 w-8" />}
    description="Configure and manage third-party system integrations."
  />;
};

export default Integrations;
