import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText } from 'lucide-react';

const DocumentTemplates: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="Document Templates"
        icon={<FileText className="h-8 w-8" />}
        description="Manage document templates for resale and transfer processes"
      >
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document Templates</h3>
            <p className="text-muted-foreground">
              This page is coming soon. You'll be able to manage document templates for resale and transfer processes here.
            </p>
          </div>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default DocumentTemplates;