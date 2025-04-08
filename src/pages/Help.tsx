
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { HelpCircle } from 'lucide-react';

const Help = () => {
  return <PageTemplate 
    title="Help" 
    icon={<HelpCircle className="h-8 w-8" />}
    description="View help resources and documentation for the Community Intelligence platform."
  />;
};

export default Help;
