
import React from 'react';
import { PageTemplate } from '@/pages/PageTemplate';
import { EnhancedEmailCampaigns } from '@/components/emails/enhanced/EnhancedEmailCampaigns';

const EnhancedEmailCampaignsPage: React.FC = () => {
  return (
    <PageTemplate
      title="Email Campaigns"
      description="Create, manage, and track professional email marketing campaigns"
    >
      <EnhancedEmailCampaigns />
    </PageTemplate>
  );
};

export default EnhancedEmailCampaignsPage;
