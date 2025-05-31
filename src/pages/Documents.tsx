
import React from 'react';
import { FileText } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import DocumentManager from '@/components/documents/DocumentManager';

const Documents = () => {
  // For demo purposes, using a default association ID
  const defaultAssociationId = 'demo-association-id';

  return (
    <PageTemplate
      title="Documents"
      icon={<FileText className="h-8 w-8" />}
      description="Manage association documents and files"
    >
      <DocumentManager associationId={defaultAssociationId} />
    </PageTemplate>
  );
};

export default Documents;
