
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText } from 'lucide-react';
import { useResponsive } from '@/hooks/use-responsive';
import { DocumentContent } from '@/components/documents/DocumentContent';

const Documents = () => {
  const { isMobile } = useResponsive();
  
  return (
    <PageTemplate 
      title="Documents" 
      icon={<FileText className="h-8 w-8" />}
      description="Access and manage community documents and files."
      className={isMobile ? 'p-0' : ''}
    >
      <DocumentContent />
    </PageTemplate>
  );
};

export default Documents;
