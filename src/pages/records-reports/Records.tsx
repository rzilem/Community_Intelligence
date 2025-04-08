
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Database } from 'lucide-react';

const Records = () => {
  return <PageTemplate 
    title="Records" 
    icon={<Database className="h-8 w-8" />}
    description="Manage and access community association records."
  />;
};

export default Records;
