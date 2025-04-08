
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { File } from 'lucide-react';

const Documents = () => {
  return <PageTemplate 
    title="Documents" 
    icon={<File className="h-8 w-8" />}
    description="Access and manage community documents and files."
  />;
};

export default Documents;
