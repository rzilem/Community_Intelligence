
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileCode } from 'lucide-react';

const TRECForms = () => {
  return <PageTemplate 
    title="TREC Forms" 
    icon={<FileCode className="h-8 w-8" />}
    description="Access and complete Texas Real Estate Commission (TREC) forms."
  />;
};

export default TRECForms;
