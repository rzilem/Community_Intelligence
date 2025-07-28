import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { UserPlus } from 'lucide-react';

const LeadFollowUps: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="Lead Follow-ups"
        icon={<UserPlus className="h-8 w-8" />}
        description="Track and manage lead follow-up activities"
      >
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <UserPlus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lead Follow-ups</h3>
            <p className="text-muted-foreground">
              Automated follow-up sequences and tracking for lead nurturing with email/SMS integration.
            </p>
          </div>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default LeadFollowUps;