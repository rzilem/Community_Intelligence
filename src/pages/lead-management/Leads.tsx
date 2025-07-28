import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Users } from 'lucide-react';

const Leads: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="Leads"
        icon={<Users className="h-8 w-8" />}
        description="Manage and track all leads in your pipeline"
      >
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lead Management</h3>
            <p className="text-muted-foreground">
              Full lead management functionality is coming soon. You'll be able to view, filter, and manage all leads here.
            </p>
          </div>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default Leads;