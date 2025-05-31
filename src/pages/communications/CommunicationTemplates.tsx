
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText } from 'lucide-react';

const CommunicationTemplates: React.FC = () => {
  return (
    <PageTemplate
      title="Communication Templates"
      icon={<FileText className="h-8 w-8" />}
      description="Manage communication templates for your HOA"
    >
      <div className="space-y-6">
        <p>Communication templates functionality coming soon...</p>
      </div>
    </PageTemplate>
  );
};

export default CommunicationTemplates;
