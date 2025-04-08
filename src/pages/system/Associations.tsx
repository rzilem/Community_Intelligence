
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Network } from 'lucide-react';

const Associations = () => {
  return <PageTemplate 
    title="Associations" 
    icon={<Network className="h-8 w-8" />}
    description="Manage community associations and client organizations."
  />;
};

export default Associations;
