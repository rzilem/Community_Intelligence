
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { EnhancedEmailCampaigns } from '@/components/emails/enhanced/EnhancedEmailCampaigns';
import { Mail } from 'lucide-react';

const EnhancedEmailCampaignsPage: React.FC = () => {
  return (
    <PageTemplate
      title="Email Campaigns"
      icon={<Mail className="h-8 w-8" />}
      description="Create, manage, and track professional email marketing campaigns"
    >
      <EnhancedEmailCampaigns />
    </PageTemplate>
  );
};

export default EnhancedEmailCampaignsPage;
