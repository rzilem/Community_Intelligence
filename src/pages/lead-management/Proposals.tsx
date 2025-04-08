
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText } from 'lucide-react';

const Proposals = () => {
  return <PageTemplate 
    title="Proposals" 
    icon={<FileText className="h-8 w-8" />}
    description="Create and track business proposals for potential clients."
  />;
};

export default Proposals;
