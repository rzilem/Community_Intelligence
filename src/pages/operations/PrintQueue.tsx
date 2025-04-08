
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Printer } from 'lucide-react';

const PrintQueue = () => {
  return <PageTemplate 
    title="Print Queue" 
    icon={<Printer className="h-8 w-8" />}
    description="Manage batch printing jobs for community mailings."
  />;
};

export default PrintQueue;
