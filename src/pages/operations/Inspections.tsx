import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { ClipboardCheck } from 'lucide-react';

const Inspections: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="Inspections"
        icon={<ClipboardCheck className="h-8 w-8" />}
        description="Manage and track property inspections and assessments"
      >
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <ClipboardCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inspections</h3>
            <p className="text-muted-foreground">
              This page is coming soon. You'll be able to schedule, manage, and track property inspections and assessments here.
            </p>
          </div>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default Inspections;