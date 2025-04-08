
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileBarChart } from 'lucide-react';

const Workflows = () => {
  return <PageTemplate 
    title="Workflows" 
    icon={<FileBarChart className="h-8 w-8" />}
    description="Setup and manage operational workflows and business processes."
  />;
};

export default Workflows;
