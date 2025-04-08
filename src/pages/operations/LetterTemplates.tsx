
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { File } from 'lucide-react';

const LetterTemplates = () => {
  return <PageTemplate 
    title="Letter Templates" 
    icon={<File className="h-8 w-8" />}
    description="Create and manage templates for community correspondence."
  />;
};

export default LetterTemplates;
