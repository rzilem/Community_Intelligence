
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import AppLayout from '@/components/layout/AppLayout';
import { EnhancedEmailCampaigns } from '@/components/emails/enhanced/EnhancedEmailCampaigns';
import { Mail } from 'lucide-react';

const EnhancedEmailCampaignsPage: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="Email Campaigns"
        icon={<Mail className="h-8 w-8" />}
        description="Create, manage, and track professional email marketing campaigns"
      >
        <EnhancedEmailCampaigns />
      </PageTemplate>
    </AppLayout>
  );
};

export default EnhancedEmailCampaignsPage;
